import { FirebaseCache } from "../firebase/cache";
import { EventsValidator } from "./EventsValidator";
import { ALL_NAVBAR_LEAGUES } from "@/lib/config/leagues";
import { format } from "date-fns";
import type {
  Match,
  TeamMatchStats,
  TeamMatchEvents,
  LineupTeam,
} from "@/types/match";

export class FastFootballApi {
  private cache: FirebaseCache;
  private eventsValidator: EventsValidator;
  private memoryCache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();

  constructor() {
    this.cache = FirebaseCache.getInstance();
    this.eventsValidator = new EventsValidator();
  }

  /**
   * Get from memory cache first, then Firebase
   */
  private async getCachedData<T>(
    collection: string,
    options: Record<string, unknown>
  ): Promise<T | null> {
    const cacheKey = `${collection}_${JSON.stringify(options)}`;

    // Check memory cache first
    const memoryCached = this.memoryCache.get(cacheKey);
    if (
      memoryCached &&
      Date.now() - memoryCached.timestamp < memoryCached.ttl
    ) {
      console.log(`💾 MEMORY HIT: ${cacheKey}`);
      return memoryCached.data as T;
    }

    // Get from Firebase
    try {
      const firebaseData = await this.cache.get<T>(collection, options);

      // Store in memory cache for 30 seconds
      if (firebaseData) {
        this.memoryCache.set(cacheKey, {
          data: firebaseData,
          timestamp: Date.now(),
          ttl: 30000, // 30 seconds
        });
      }

      return firebaseData;
    } catch (error) {
      console.error(`Error getting cached data for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Get fixtures from Firebase cache (super fast)
   */
  async getFixturesByDateRangeAndLeague(
    from: string,
    to: string,
    leagueId: number
  ): Promise<Match[]> {
    const cacheKey = `fixtures_${leagueId}_${from}_${to}`;

    try {
      const cached = await this.getCachedData<Match[]>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // If no exact match, try individual days
      if (from === to) {
        const dailyKey = `fixtures_${leagueId}_${from}_${from}`;
        const dailyCached = await this.getCachedData<Match[]>(dailyKey, {});

        if (dailyCached) {
          return dailyCached;
        }
      }

      console.log(`⚪ No cached fixtures found for ${cacheKey}`);

      try {
        // Import FootballApiServer dynamically to avoid circular imports
        const { FootballApiServer } = await import("../footballApi");
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK: FOOTBALL_API_KEY not found");
          return [];
        }

        const externalApi = new FootballApiServer(apiKey as string);
        const externalData = await externalApi.getFixturesByDateAndLeague(
          from,
          leagueId
        );

        if (externalData && externalData.length > 0) {
          console.log(
            `✅ FALLBACK: Found ${externalData.length} matches from external API, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "fixtures",
            { key: cacheKey },
            externalData,
            60 // 1 hour TTL for fresh data
          );

          // Also save with daily key for individual day lookups
          if (from === to) {
            const dailyKey = `fixtures_${leagueId}_${from}_${from}`;
            await this.cache.set(
              "fixtures",
              { key: dailyKey },
              externalData,
              60 // 1 hour TTL for fresh data
            );
          }

          return externalData;
        } else {
          console.log(
            `⚪ FALLBACK: No matches found in external API for ${cacheKey}`
          );

          // Cache empty result to avoid repeated API calls
          await this.cache.set(
            "fixtures",
            { key: cacheKey },
            [],
            30 // 30 minutes TTL for empty results
          );

          return [];
        }
      } catch (fallbackError) {
        console.error(`❌ FALLBACK ERROR for ${cacheKey}:`, fallbackError);
        return [];
      }
    } catch (error) {
      console.error("Error retrieving fixtures from cache:", error);
      return [];
    }
  }

  /**
   * Get match statistics from Firebase cache with automatic fallback
   */
  async getMatchStats(
    matchId: number
  ): Promise<{ home: TeamMatchStats; away: TeamMatchStats } | null> {
    const cacheKey = `match_stats_${matchId}`;

    try {
      const cached = await this.getCachedData<{
        home: TeamMatchStats;
        away: TeamMatchStats;
      }>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // FALLBACK: If no cached data found, fetch from external API
      console.log(
        `🔄 FALLBACK STATS: No cached data for ${cacheKey}, fetching from external API...`
      );

      try {
        // Import FootballApiServer dynamically to avoid circular imports
        const { FootballApiServer } = await import("../footballApi");
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK STATS: FOOTBALL_API_KEY not found");
          return null;
        }

        const externalApi = new FootballApiServer(apiKey);

        // We need the match object to get stats, but we only have the ID
        // This method is deprecated, but for backwards compatibility we create a minimal match
        const match = {
          fixture: { id: matchId, date: "", status: { long: "", short: "" } },
          teams: {
            home: { id: 0, name: "", logo: "" },
            away: { id: 0, name: "", logo: "" },
          },
          goals: { home: 0, away: 0 },
          league: { id: 0, name: "", logo: "", country: "" },
        } as Match;
        const externalData = await externalApi.getMatchStats(match);

        if (externalData) {
          console.log(
            `✅ FALLBACK STATS: Found stats for match ${matchId}, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "match_stats",
            { key: cacheKey },
            externalData,
            1440 // 24 hours TTL for match stats
          );

          return externalData;
        } else {
          console.log(`⚪ FALLBACK STATS: No stats found for match ${matchId}`);

          // Cache null result to avoid repeated API calls
          await this.cache.set(
            "match_stats",
            { key: cacheKey },
            null,
            120 // 2 hours TTL for null results (stats might be added during/after match)
          );

          return null;
        }
      } catch (fallbackError) {
        console.error(
          `❌ FALLBACK STATS ERROR for ${cacheKey}:`,
          fallbackError
        );
        return null;
      }
    } catch (error) {
      console.error("Error retrieving match stats from cache:", error);
      return null;
    }
  }

  /**
   * Get match events from Firebase cache with automatic fallback
   */
  async getMatchEvents(
    matchId: number
  ): Promise<{ home: TeamMatchEvents; away: TeamMatchEvents } | null> {
    const cacheKey = `match_events_${matchId}`;

    try {
      const cached = await this.getCachedData<{
        home: TeamMatchEvents;
        away: TeamMatchEvents;
      }>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // FALLBACK: If no cached data found, fetch from external API
      console.log(
        `🔄 FALLBACK EVENTS: No cached data for ${cacheKey}, fetching from external API...`
      );

      try {
        // Import FootballApiServer dynamically to avoid circular imports
        const { FootballApiServer } = await import("../footballApi");
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK EVENTS: FOOTBALL_API_KEY not found");
          return null;
        }

        const externalApi = new FootballApiServer(apiKey);

        // We need the match object to get events, so we create a minimal one
        const match = {
          fixture: { id: matchId, date: "", status: { long: "", short: "" } },
          teams: {
            home: { id: 0, name: "", logo: "" },
            away: { id: 0, name: "", logo: "" },
          },
          goals: { home: 0, away: 0 },
          league: { id: 0, name: "", logo: "", country: "" },
        } as Match;
        const externalData = await externalApi.getMatchEvents(match);

        if (externalData) {
          console.log(
            `✅ FALLBACK EVENTS: Found events for match ${matchId}, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "match_events",
            { key: cacheKey },
            externalData,
            1440 // 24 hours TTL for match events
          );

          return externalData;
        } else {
          console.log(
            `⚪ FALLBACK EVENTS: No events found for match ${matchId}`
          );

          // Cache null result to avoid repeated API calls
          await this.cache.set(
            "match_events",
            { key: cacheKey },
            null,
            120 // 2 hours TTL for null results (events might be added during/after match)
          );

          return null;
        }
      } catch (fallbackError) {
        console.error(
          `❌ FALLBACK EVENTS ERROR for ${cacheKey}:`,
          fallbackError
        );
        return null;
      }
    } catch (error) {
      console.error("Error retrieving match events from cache:", error);
      return null;
    }
  }

  /**
   * Get match events with team information preserved
   */
  async getMatchEventsWithTeamInfo(
    match: Match
  ): Promise<{ home: TeamMatchEvents; away: TeamMatchEvents } | null> {
    const cacheKey = `match_events_${match.fixture.id}`;

    try {
      const cached = await this.getCachedData<{
        home: TeamMatchEvents;
        away: TeamMatchEvents;
      }>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // FALLBACK: If no cached data found, fetch from external API
      console.log(
        `🔄 FALLBACK EVENTS: No cached data for ${cacheKey}, fetching from external API...`
      );

      try {
        // Import FootballApiServer dynamically to avoid circular imports
        const { FootballApiServer } = await import("../footballApi");
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK EVENTS: FOOTBALL_API_KEY not found");
          return null;
        }

        const externalApi = new FootballApiServer(apiKey);

        // Pass the full match object to preserve team information for correct event assignment
        const externalData = await externalApi.getMatchEvents(match);

        if (externalData) {
          console.log(
            `✅ FALLBACK EVENTS: Found events for match ${match.fixture.id}, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "match_events",
            { key: cacheKey },
            externalData,
            1440 // 24 hours TTL for match events
          );

          return externalData;
        } else {
          console.log(
            `⚪ FALLBACK EVENTS: No events found for match ${match.fixture.id}`
          );

          // Cache null result to avoid repeated API calls
          await this.cache.set(
            "match_events",
            { key: cacheKey },
            null,
            120 // 2 hours TTL for null results
          );

          return null;
        }
      } catch (fallbackError) {
        console.error(
          `❌ FALLBACK EVENTS ERROR for ${cacheKey}:`,
          fallbackError
        );
        return null;
      }
    } catch (error) {
      console.error("Error retrieving match events from cache:", error);
      return null;
    }
  }

  /**
   * Get match stats with team information preserved
   */
  async getMatchStatsWithMatchInfo(
    match: Match
  ): Promise<{ home: TeamMatchStats; away: TeamMatchStats } | null> {
    const cacheKey = `match_stats_${match.fixture.id}`;

    try {
      // Try to get from cache first
      const cached = await this.getCachedData<{
        home: TeamMatchStats;
        away: TeamMatchStats;
      }>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // If not in cache, call external API with full match object
      console.log(
        `🔄 FALLBACK STATS: No cached data for ${cacheKey}, fetching from external API...`
      );

      try {
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK STATS: FOOTBALL_API_KEY not found");
          return null;
        }

        const { FootballApiServer } = await import("../footballApi");
        const externalApi = new FootballApiServer(apiKey);
        // Pass the full match object with team information
        const externalData = await externalApi.getMatchStats(match);

        if (externalData) {
          console.log(
            `✅ FALLBACK STATS: Found stats for match ${match.fixture.id}, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "match_stats",
            { key: cacheKey },
            externalData,
            1440 // 24 hours TTL for match stats
          );

          return externalData;
        } else {
          console.log(
            `⚪ FALLBACK STATS: No stats found for match ${match.fixture.id}`
          );

          // Cache null result to avoid repeated API calls
          await this.cache.set(
            "match_stats",
            { key: cacheKey },
            null,
            120 // 2 hours TTL for null results
          );

          return null;
        }
      } catch (fallbackError) {
        console.error(
          `❌ FALLBACK STATS ERROR for ${cacheKey}:`,
          fallbackError
        );
        return null;
      }
    } catch (error) {
      console.error("Error retrieving match stats from cache:", error);
      return null;
    }
  }

  /**
   * Get match lineups from Firebase cache with automatic fallback
   */
  async getMatchLineups(
    fixtureId: string,
    homeId: string,
    awayId: string
  ): Promise<{ home: LineupTeam | null; away: LineupTeam | null } | null> {
    const cacheKey = `lineups_${fixtureId}_${homeId}_${awayId}`;

    try {
      const cached = await this.getCachedData<{
        home: LineupTeam | null;
        away: LineupTeam | null;
      }>(cacheKey, {});

      if (cached) {
        return cached;
      }

      // FALLBACK: If no cached data found, fetch from external API
      console.log(
        `🔄 FALLBACK LINEUPS: No cached data for ${cacheKey}, fetching from external API...`
      );

      try {
        // Import FootballApiServer dynamically to avoid circular imports
        const { FootballApiServer } = await import("../footballApi");
        const apiKey = process.env.FOOTBALL_API_KEY;

        if (!apiKey) {
          console.error("❌ FALLBACK LINEUPS: FOOTBALL_API_KEY not found");
          return null;
        }

        const externalApi = new FootballApiServer(apiKey);
        const externalData = await externalApi.getMatchLineups(
          fixtureId,
          homeId,
          awayId
        );

        if (externalData) {
          console.log(
            `✅ FALLBACK LINEUPS: Found lineups for match ${fixtureId}, saving to cache...`
          );

          // Save to cache for future use
          await this.cache.set(
            "lineups",
            { key: cacheKey },
            externalData,
            43200 // 30 days TTL for lineups (they don't change)
          );

          return externalData;
        } else {
          console.log(
            `⚪ FALLBACK LINEUPS: No lineups found for match ${fixtureId}`
          );

          // Cache null result to avoid repeated API calls for matches without lineups
          await this.cache.set(
            "lineups",
            { key: cacheKey },
            null,
            1440 // 24 hours TTL for null results (lineups might be added later)
          );

          return null;
        }
      } catch (fallbackError) {
        console.error(
          `❌ FALLBACK LINEUPS ERROR for ${cacheKey}:`,
          fallbackError
        );

        // Cache error result to avoid immediate retries
        await this.cache.set(
          "lineups",
          { key: cacheKey },
          null,
          60 // 1 hour TTL for error results
        );

        return null;
      }
    } catch (error) {
      console.error("Error retrieving match lineups from cache:", error);
      return null;
    }
  }

  /**
   * Get multiple leagues fixtures for a specific date (ULTRA OPTIMIZED - single query)
   */
  async getMultipleLeaguesFixtures(
    date: string,
    leagueIds: number[]
  ): Promise<Match[]> {
    try {
      // Create a single combined cache key for multiple leagues
      const cacheKeys = leagueIds.map(id => `fixtures_${id}_${date}_${date}`);

      // Try to get all data in one batch operation
      const batchResults = await Promise.all(
        cacheKeys.map(async (key, _index) => {
          try {
            const cached = await this.getCachedData<Match[]>(key, {});
            return cached || [];
          } catch (error) {
            console.error(`Error getting cache for ${key}:`, error);
            return [];
          }
        })
      );

      // Flatten all results
      const allMatches = batchResults.flat();

      // Check if we have any data, if not, try individual fallbacks
      if (allMatches.length === 0) {
        // Try fallback for each league individually
        const fallbackResults = await Promise.all(
          leagueIds.map(async leagueId => {
            return this.getFixturesByDateRangeAndLeague(date, date, leagueId);
          })
        );

        const fallbackMatches = fallbackResults.flat();
        return fallbackMatches;
      }

      // Sort by date and status (finished matches first)
      allMatches.sort((a, b) => {
        const aFinished = ["FT", "AET", "PEN", "AWD", "WO"].includes(
          a.fixture.status.short
        );
        const bFinished = ["FT", "AET", "PEN", "AWD", "WO"].includes(
          b.fixture.status.short
        );

        if (aFinished && !bFinished) return -1;
        if (!aFinished && bFinished) return 1;

        return (
          new Date(b.fixture.date).getTime() -
          new Date(a.fixture.date).getTime()
        );
      });

      return allMatches;
    } catch (error) {
      console.error("Error in ultra-fast batch retrieval:", error);
      // Fallback to individual calls if batch fails
      return this.getMultipleLeaguesFixturesFallback(date, leagueIds);
    }
  }

  /**
   * Fallback method for individual league calls
   */
  private async getMultipleLeaguesFixturesFallback(
    date: string,
    leagueIds: number[]
  ): Promise<Match[]> {
    const allMatches: Match[] = [];

    // Get all leagues in parallel (super fast from cache)
    const leaguePromises = leagueIds.map(async leagueId => {
      const matches = await this.getFixturesByDateRangeAndLeague(
        date,
        date,
        leagueId
      );
      return matches;
    });

    const leagueResults = await Promise.all(leaguePromises);

    // Flatten results
    leagueResults.forEach(matches => {
      allMatches.push(...matches);
    });

    // Sort by date and status (finished matches first)
    allMatches.sort((a, b) => {
      const aFinished = ["FT", "AET", "PEN", "AWD", "WO"].includes(
        a.fixture.status.short
      );
      const bFinished = ["FT", "AET", "PEN", "AWD", "WO"].includes(
        b.fixture.status.short
      );

      if (aFinished && !bFinished) return -1;
      if (!aFinished && bFinished) return 1;

      return (
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
      );
    });

    return allMatches;
  }

  /**
   * Get matches with full details (stats, events, lineups) - OPTIMIZED
   */
  async getMatchesWithDetails(matches: Match[]): Promise<Match[]> {
    console.log(
      `🔍 getMatchesWithDetails called with ${matches.length} matches`
    );
    if (matches.length === 0) return matches;

    // Get all match IDs that need details
    const detailedMatches = matches.filter(match =>
      [
        "FT",
        "AET",
        "PEN",
        "AWD",
        "WO",
        "1H",
        "2H",
        "LIVE",
        "ET",
        "P",
        "HT",
      ].includes(match.fixture.status.short)
    );

    console.log(
      `🔍 Found ${detailedMatches.length} matches that need details:`,
      detailedMatches.map(
        m =>
          `${m.teams.home.name} vs ${m.teams.away.name} (${m.fixture.status.short})`
      )
    );

    if (detailedMatches.length === 0) {
      console.log(`⚠️ No matches need details, returning original matches`);
      return matches;
    }

    // Batch get all stats, events, and lineups in parallel
    const [allStats, allEvents, allLineups] = await Promise.all([
      this.getBatchStats(detailedMatches),
      this.getBatchEvents(detailedMatches),
      this.getBatchLineups(detailedMatches),
    ]);

    // Enrich matches with the batch data
    const enrichedMatches = matches.map(match => {
      if (
        ![
          "FT",
          "AET",
          "PEN",
          "AWD",
          "WO",
          "1H",
          "2H",
          "LIVE",
          "ET",
          "P",
          "HT",
        ].includes(match.fixture.status.short)
      ) {
        return match;
      }

      const matchId = match.fixture.id.toString();
      const stats = allStats[matchId];
      const events = allEvents[matchId];
      const lineups = allLineups[matchId];

      return {
        ...match,
        ...(stats && { statistics: stats }),
        ...(events && { events: events }),
        ...(lineups && { lineups: lineups }),
      };
    });

    // VALIDATE AND FIX EVENTS: Check for inconsistent events and fix automatically
    console.log(
      `🔧 EVENTS VALIDATION: Checking ${enrichedMatches.length} matches for event consistency`
    );
    const validatedMatches = await this.eventsValidator.bulkFixMatches(
      enrichedMatches,
      (matchId: number) => this.getMatchEvents(matchId)
    );

    return validatedMatches;
  }

  /**
   * Batch get stats for multiple matches - OPTIMIZED
   */
  private async getBatchStats(
    matches: Match[]
  ): Promise<Record<string, { home: TeamMatchStats; away: TeamMatchStats }>> {
    console.log(`📊 getBatchStats called for ${matches.length} matches`);
    const results: Record<
      string,
      { home: TeamMatchStats; away: TeamMatchStats }
    > = {};

    try {
      // Use getMatchStatsWithMatchInfo for each match (which includes fallback logic)
      const batchResults = await Promise.all(
        matches.map(async match => {
          try {
            const stats = await this.getMatchStatsWithMatchInfo(match);
            console.log(
              `📊 Stats result for match ${match.fixture.id}:`,
              stats ? "FOUND" : "NOT FOUND"
            );
            return { matchId: match.fixture.id.toString(), data: stats };
          } catch (error) {
            console.error(
              `Error getting stats for match ${match.fixture.id}:`,
              error
            );
            return {
              matchId: match.fixture.id.toString(),
              data: null,
            };
          }
        })
      );

      // Process results
      batchResults.forEach(result => {
        if (result.data) {
          results[result.matchId] = result.data;
        }
      });

      console.log(
        `📊 getBatchStats found ${Object.keys(results).length} matches with stats`
      );
    } catch (error) {
      console.error("Error in batch stats retrieval:", error);
    }

    return results;
  }

  /**
   * Batch get events for multiple matches - OPTIMIZED
   */
  private async getBatchEvents(
    matches: Match[]
  ): Promise<Record<string, { home: TeamMatchEvents; away: TeamMatchEvents }>> {
    console.log(`🎯 getBatchEvents called for ${matches.length} matches`);
    const results: Record<
      string,
      { home: TeamMatchEvents; away: TeamMatchEvents }
    > = {};

    try {
      // Use getMatchEvents for each match (which includes fallback logic)
      const batchResults = await Promise.all(
        matches.map(async match => {
          try {
            // Pass the full match object to preserve team info for correct event assignment
            const events = await this.getMatchEventsWithTeamInfo(match);
            console.log(
              `🎯 Events result for match ${match.fixture.id}:`,
              events ? "FOUND" : "NOT FOUND"
            );
            return { matchId: match.fixture.id.toString(), data: events };
          } catch (error) {
            console.error(
              `Error getting events for match ${match.fixture.id}:`,
              error
            );
            return {
              matchId: match.fixture.id.toString(),
              data: null,
            };
          }
        })
      );

      // Process results
      batchResults.forEach(result => {
        if (result.data) {
          results[result.matchId] = result.data;
        }
      });

      console.log(
        `🎯 getBatchEvents found ${Object.keys(results).length} matches with events`
      );
    } catch (error) {
      console.error("Error in batch events retrieval:", error);
    }

    return results;
  }

  /**
   * Batch get lineups for multiple matches - OPTIMIZED
   */
  private async getBatchLineups(
    matches: Match[]
  ): Promise<
    Record<string, { home: LineupTeam | null; away: LineupTeam | null }>
  > {
    console.log(`⚽ getBatchLineups called for ${matches.length} matches`);
    const results: Record<
      string,
      { home: LineupTeam | null; away: LineupTeam | null }
    > = {};

    // Filter matches that can have lineups
    const validMatches = matches.filter(
      match => match.fixture.status.short !== "NS"
    );

    console.log(`⚽ Found ${validMatches.length} valid matches for lineups`);

    if (validMatches.length === 0) return results;

    try {
      // Use getMatchLineups for each match (which includes fallback logic)
      const batchResults = await Promise.all(
        validMatches.map(async match => {
          try {
            const lineups = await this.getMatchLineups(
              match.fixture.id.toString(),
              match.teams.home.id.toString(),
              match.teams.away.id.toString()
            );
            console.log(
              `⚽ Lineups result for match ${match.fixture.id}:`,
              lineups ? "FOUND" : "NOT FOUND"
            );
            return { matchId: match.fixture.id.toString(), data: lineups };
          } catch (error) {
            console.error(
              `Error getting lineups for match ${match.fixture.id}:`,
              error
            );
            return {
              matchId: match.fixture.id.toString(),
              data: null,
            };
          }
        })
      );

      // Process results
      batchResults.forEach(result => {
        if (result.data) {
          results[result.matchId] = result.data;
        }
      });

      console.log(
        `⚽ getBatchLineups found ${Object.keys(results).length} matches with lineups`
      );
    } catch (error) {
      console.error("Error in batch lineups retrieval:", error);
    }

    return results;
  }

  /**
   * Get live matches (currently happening)
   */
  async getLiveMatches(leagueIds?: number[]): Promise<Match[]> {
    const today = format(new Date(), "yyyy-MM-dd");
    const leagues = leagueIds || [...ALL_NAVBAR_LEAGUES];
    const allMatches = await this.getMultipleLeaguesFixtures(today, leagues);

    // Filter only live matches
    const liveMatches = allMatches.filter(match =>
      ["1H", "2H", "LIVE", "ET", "P", "HT"].includes(match.fixture.status.short)
    );

    // Get details for live matches
    return this.getMatchesWithDetails(liveMatches);
  }
}
