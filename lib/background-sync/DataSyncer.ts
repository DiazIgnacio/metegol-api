// Background Data Syncer - Syncs external API data to Firebase
import { FootballApiServer } from "../footballApi";
import { FirebaseCache } from "../firebase/cache";
import { format, subDays, addDays } from "date-fns";
import type { Match } from "@/types/match";

interface SyncJob {
  id: string;
  type: "fixtures" | "stats" | "events" | "lineups" | "teams" | "leagues";
  status: "pending" | "running" | "completed" | "failed";
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata: Record<string, unknown>;
}

interface SyncStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  lastSyncTime: number;
  apiCallsToday: number;
  dataItemsSynced: number;
}

export class DataSyncer {
  private api: FootballApiServer;
  private cache: FirebaseCache;
  private syncQueue: SyncJob[] = [];
  private isRunning = false;
  private stats: SyncStats = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    lastSyncTime: 0,
    apiCallsToday: 0,
    dataItemsSynced: 0,
  };

  // Priority leagues to sync (most active/popular)
  private defaultLeagues = [
    128,
    129,
    130, // Argentina (Liga Profesional, Primera Nacional, Copa Argentina)
    2,
    3,
    848, // UEFA (Champions, Europa, Conference)
    140,
    39,
    135,
    78,
    61, // Top 5 European leagues
    13,
    11, // CONMEBOL (Libertadores, Sudamericana)
    71,
    73, // Brazil (Brasileirão A, Copa do Brasil)
    15, // Mundial de Clubes
  ];

  constructor(apiKey: string) {
    this.api = new FootballApiServer(apiKey);
    this.cache = FirebaseCache.getInstance();
  }

  /**
   * Sync today's fixtures and related data
   */
  async syncTodaysData(): Promise<void> {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    console.log(`🔄 SYNC: Starting sync for ${today}`);

    // Queue fixtures for today and yesterday (for late finishers)
    await this.queueFixturesSync([today, yesterday]);

    // Process the queue
    await this.processQueue();
  }

  /**
   * Sync historical data (last 30 days) - OPTIMIZED for API limits
   */
  async syncHistoricalData(): Promise<void> {
    const today = new Date();
    const dates: string[] = [];

    // Get last 30 days of data, prioritizing recent dates
    for (let i = 1; i <= 30; i++) {
      const date = format(subDays(today, i), "yyyy-MM-dd");
      dates.push(date);
    }

    console.log(`📚 HISTORICAL SYNC: Starting sync for last 30 days`);

    // Process only 2-3 dates per batch to respect API limits
    const batches = [];
    for (let i = 0; i < dates.length; i += 3) {
      batches.push(dates.slice(i, i + 3));
    }

    for (const batch of batches) {
      console.log(`📚 HISTORICAL SYNC: Processing batch ${batch.join(", ")}`);

      // Queue fixtures for this batch
      await this.queueFixturesSync(batch);

      // Queue detailed data for finished matches
      for (const date of batch) {
        await this.queueDetailedDataSync(date);
      }

      // Process this batch
      await this.processQueue();

      // Wait 6 seconds between batches to respect rate limits (10/minute)
      if (batch !== batches[batches.length - 1]) {
        console.log(`⏳ HISTORICAL SYNC: Waiting 6s to respect rate limits...`);
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
    }

    console.log(`✅ HISTORICAL SYNC: Completed historical data sync`);
  }

  /**
   * Smart sync based on time of day - OPTIMIZED for API limits
   */
  async smartSync(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const today = format(now, "yyyy-MM-dd");
    const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");
    const yesterday = format(subDays(now, 1), "yyyy-MM-dd");

    console.log(
      `🧠 SMART SYNC: Starting at ${hour}:${now.getMinutes()} (API: ${this.stats.apiCallsToday}/7500)`
    );

    // Check if we're approaching API limits
    const apiUsagePercent = (this.stats.apiCallsToday / 7500) * 100;

    if (apiUsagePercent > 80) {
      console.log(
        `⚠️ SMART SYNC: High API usage (${apiUsagePercent.toFixed(1)}%), limiting operations`
      );
    }

    // Morning (6-10): Sync yesterday's final results + today's fixtures
    if (hour >= 6 && hour < 10) {
      await this.queueFixturesSync([yesterday, today]);
      if (apiUsagePercent < 60) {
        await this.queueDetailedDataSync(yesterday); // Only if we have API budget
      }
      console.log(
        "🌅 MORNING SYNC: Yesterday + today" +
          (apiUsagePercent < 60 ? " + details" : "")
      );
    }

    // Afternoon (10-18): Focus on today's matches + detailed data
    else if (hour >= 10 && hour < 18) {
      await this.queueFixturesSync([today]);
      await this.queueDetailedDataSync(today);
      console.log("☀️ AFTERNOON SYNC: Today's matches + details");
    }

    // Evening (18-22): Live matches + tomorrow's fixtures + detailed data for today
    else if (hour >= 18 && hour < 22) {
      await this.queueFixturesSync([today, tomorrow]);
      await this.queueDetailedDataSync(today);
      await this.queueLiveMatchesSync();
      console.log("🌆 EVENING SYNC: Live matches + tomorrow + today's details");
    }

    // Night (22-6): Light sync, tomorrow's fixtures only
    else {
      await this.queueFixturesSync([tomorrow]);
      console.log("🌙 NIGHT SYNC: Tomorrow's fixtures only");
    }

    await this.processQueue();
  }

  /**
   * Queue fixtures sync for specific dates
   */
  private async queueFixturesSync(dates: string[]): Promise<void> {
    for (const date of dates) {
      for (const leagueId of this.defaultLeagues) {
        const jobId = `fixtures_${leagueId}_${date}`;

        if (!this.syncQueue.find(job => job.id === jobId)) {
          this.syncQueue.push({
            id: jobId,
            type: "fixtures",
            status: "pending",
            createdAt: Date.now(),
            metadata: { date, leagueId },
          });
        }
      }
    }

    console.log(
      `📅 QUEUED: Fixtures for ${dates.join(", ")} (${this.defaultLeagues.length} leagues each)`
    );
  }

  /**
   * Queue detailed data sync (stats, events) for matches on a specific date
   */
  private async queueDetailedDataSync(date: string): Promise<void> {
    // First get fixtures to know which matches need detailed data
    for (const leagueId of this.defaultLeagues) {
      try {
        const fixtures = await this.api.getFixturesByDateRangeAndLeague(
          date,
          date,
          leagueId
        );

        for (const match of fixtures) {
          // Only sync details for finished or live matches
          if (
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
          ) {
            // Queue stats
            const statsJobId = `stats_${match.fixture.id}`;
            if (!this.syncQueue.find(job => job.id === statsJobId)) {
              this.syncQueue.push({
                id: statsJobId,
                type: "stats",
                status: "pending",
                createdAt: Date.now(),
                metadata: { match },
              });
            }

            // Queue events
            const eventsJobId = `events_${match.fixture.id}`;
            if (!this.syncQueue.find(job => job.id === eventsJobId)) {
              this.syncQueue.push({
                id: eventsJobId,
                type: "events",
                status: "pending",
                createdAt: Date.now(),
                metadata: { match },
              });
            }

            // Queue lineups for finished matches
            if (
              ["FT", "AET", "PEN", "AWD", "WO"].includes(
                match.fixture.status.short
              )
            ) {
              const lineupsJobId = `lineups_${match.fixture.id}`;
              if (!this.syncQueue.find(job => job.id === lineupsJobId)) {
                this.syncQueue.push({
                  id: lineupsJobId,
                  type: "lineups",
                  status: "pending",
                  createdAt: Date.now(),
                  metadata: {
                    fixtureId: match.fixture.id.toString(),
                    homeId: match.teams.home.id.toString(),
                    awayId: match.teams.away.id.toString(),
                  },
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(
          `Error queuing detailed data for league ${leagueId}:`,
          error
        );
      }
    }

    console.log(`📊 QUEUED: Detailed data for ${date}`);
  }

  /**
   * Queue live matches for high-priority sync
   */
  private async queueLiveMatchesSync(): Promise<void> {
    const today = format(new Date(), "yyyy-MM-dd");

    for (const leagueId of this.defaultLeagues) {
      try {
        const fixtures = await this.api.getFixturesByDateRangeAndLeague(
          today,
          today,
          leagueId
        );
        const liveMatches = fixtures.filter(match =>
          ["1H", "2H", "LIVE", "ET", "P", "HT"].includes(
            match.fixture.status.short
          )
        );

        for (const match of liveMatches) {
          // High priority stats sync for live matches
          const statsJobId = `live_stats_${match.fixture.id}`;
          const eventsJobId = `live_events_${match.fixture.id}`;

          // Remove existing jobs and add high priority ones
          this.syncQueue = this.syncQueue.filter(
            job =>
              job.id !== `stats_${match.fixture.id}` &&
              job.id !== `events_${match.fixture.id}`
          );

          this.syncQueue.unshift({
            // Add to front of queue (high priority)
            id: statsJobId,
            type: "stats",
            status: "pending",
            createdAt: Date.now(),
            metadata: { match, priority: "high" },
          });

          this.syncQueue.unshift({
            id: eventsJobId,
            type: "events",
            status: "pending",
            createdAt: Date.now(),
            metadata: { match, priority: "high" },
          });
        }

        if (liveMatches.length > 0) {
          console.log(
            `🔴 PRIORITIZED: ${liveMatches.length} live matches from league ${leagueId}`
          );
        }
      } catch (error) {
        console.error(
          `Error queuing live matches for league ${leagueId}:`,
          error
        );
      }
    }
  }

  /**
   * Process the sync queue - RESPECTS RATE LIMITS
   */
  private async processQueue(): Promise<void> {
    if (this.isRunning) {
      console.log("⏸️ SYNC: Queue already processing");
      return;
    }

    this.isRunning = true;
    console.log(
      `⚡ SYNC: Processing ${this.syncQueue.length} jobs (Rate limit: 10/min)`
    );

    try {
      const pendingJobs = this.syncQueue.filter(
        job => job.status === "pending"
      );

      // Respect rate limit: maximum 10 requests per minute
      const maxRequestsPerMinute = 10;
      const delayBetweenRequests = (60 * 1000) / maxRequestsPerMinute; // 6 seconds

      let jobsProcessed = 0;
      const startTime = Date.now();

      for (const job of pendingJobs) {
        // Check if we should abort due to high API usage
        const apiUsagePercent = (this.stats.apiCallsToday / 7500) * 100;
        if (apiUsagePercent > 90) {
          console.log(
            `🛑 SYNC: Stopping due to high API usage (${apiUsagePercent.toFixed(1)}%)`
          );
          break;
        }

        await this.processJob(job);
        jobsProcessed++;

        // Wait between requests to respect rate limit (except for last job)
        if (jobsProcessed < pendingJobs.length) {
          console.log(
            `⏳ SYNC: Waiting ${delayBetweenRequests}ms for rate limit...`
          );
          await new Promise(resolve =>
            setTimeout(resolve, delayBetweenRequests)
          );
        }
      }

      this.updateStats();
      const totalTime = Date.now() - startTime;
      console.log(
        `✅ SYNC: Queue processing complete (${this.stats.completedJobs}/${this.stats.totalJobs} successful) in ${totalTime}ms`
      );
    } finally {
      this.isRunning = false;
      this.stats.lastSyncTime = Date.now();
    }
  }

  /**
   * Process individual sync job
   */
  private async processJob(job: SyncJob): Promise<void> {
    const startTime = Date.now();
    job.status = "running";
    job.startedAt = startTime;

    try {
      console.log(`🔄 SYNC JOB: ${job.type} - ${job.id}`);

      let data: unknown;
      let cacheKey: string;
      let ttl: number;

      switch (job.type) {
        case "fixtures":
          const { date, leagueId } = job.metadata;
          data = await this.api.getFixturesByDateRangeAndLeague(
            date as string,
            date as string,
            leagueId as number
          );
          cacheKey = `fixtures_${leagueId}_${date}_${date}`;
          ttl = this.calculateTTL(data as Match[], "fixtures");
          break;

        case "stats":
          const { match } = job.metadata;
          data = await this.api.getMatchStats(match as Match);
          cacheKey = `match_stats_${(match as Match).fixture.id}`;
          ttl = this.calculateTTL([match as Match], "stats");
          break;

        case "events":
          const eventMatch = job.metadata.match as Match;
          data = await this.api.getMatchEvents(eventMatch);
          cacheKey = `match_events_${eventMatch.fixture.id}`;
          ttl = this.calculateTTL([eventMatch], "events");
          break;

        case "lineups":
          const { fixtureId, homeId, awayId } = job.metadata;
          data = await this.api.getMatchLineups(
            fixtureId as string,
            homeId as string,
            awayId as string
          );
          cacheKey = `lineups_${fixtureId}_${homeId}_${awayId}`;
          ttl = 43200; // 30 days for lineups
          break;

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Store in Firebase with appropriate TTL
      await this.cache.set(cacheKey, {}, data, ttl);

      job.status = "completed";
      job.completedAt = Date.now();
      this.stats.apiCallsToday++;
      this.stats.dataItemsSynced++;

      const duration = job.completedAt - startTime;
      console.log(`✅ SYNC JOB: ${job.id} completed in ${duration}ms`);
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ SYNC JOB: ${job.id} failed:`, job.error);
    }
  }

  /**
   * Calculate appropriate TTL based on data type and match status
   */
  private calculateTTL(matches: Match[], _dataType: string): number {
    if (!matches || matches.length === 0) return 60; // 1 hour default

    const hasFinishedMatches = matches.some(match =>
      ["FT", "AET", "PEN", "AWD", "WO"].includes(match.fixture.status.short)
    );

    const hasLiveMatches = matches.some(match =>
      ["1H", "2H", "LIVE", "ET", "P", "HT"].includes(match.fixture.status.short)
    );

    const hasPastMatches = matches.some(match => {
      const matchDate = new Date(match.fixture.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return (
        matchDate < today &&
        ["FT", "AET", "PEN", "AWD", "WO"].includes(match.fixture.status.short)
      );
    });

    // Past finished matches - 30 days
    if (hasPastMatches) return 43200;

    // Today's finished matches - long cache
    if (hasFinishedMatches && !hasLiveMatches) return 1440; // 24 hours

    // Live matches - short cache
    if (hasLiveMatches) return 5; // 5 minutes

    // Future matches - medium cache
    return 60; // 1 hour
  }

  /**
   * Update sync statistics
   */
  private updateStats(): void {
    const completed = this.syncQueue.filter(job => job.status === "completed");
    const failed = this.syncQueue.filter(job => job.status === "failed");

    this.stats.totalJobs = this.syncQueue.length;
    this.stats.completedJobs = completed.length;
    this.stats.failedJobs = failed.length;

    // Clean up old completed jobs
    this.syncQueue = this.syncQueue.filter(
      job =>
        job.status === "pending" ||
        job.status === "running" ||
        (job.completedAt && Date.now() - job.completedAt < 60 * 60 * 1000) // Keep for 1 hour
    );
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats & { queueLength: number; runningJobs: number } {
    const runningJobs = this.syncQueue.filter(
      job => job.status === "running"
    ).length;
    return {
      ...this.stats,
      queueLength: this.syncQueue.length,
      runningJobs,
    };
  }

  /**
   * Force sync specific data
   */
  async forceSync(
    type: "today" | "yesterday" | "tomorrow" | "live"
  ): Promise<void> {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    switch (type) {
      case "today":
        await this.queueFixturesSync([today]);
        await this.queueDetailedDataSync(today);
        break;
      case "yesterday":
        await this.queueFixturesSync([yesterday]);
        await this.queueDetailedDataSync(yesterday);
        break;
      case "tomorrow":
        await this.queueFixturesSync([tomorrow]);
        break;
      case "live":
        await this.queueLiveMatchesSync();
        break;
    }

    await this.processQueue();
  }

  /**
   * Stop sync process
   */
  stop(): void {
    this.isRunning = false;
    this.syncQueue.forEach(job => {
      if (job.status === "running") {
        job.status = "failed";
        job.error = "Stopped by user";
      }
    });
    console.log("⏹️ SYNC: Stopped by user");
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    const pendingCount = this.syncQueue.filter(
      job => job.status === "pending"
    ).length;
    this.syncQueue = this.syncQueue.filter(job => job.status === "running");
    console.log(`🗑️ SYNC: Cleared ${pendingCount} pending jobs`);
  }
}
