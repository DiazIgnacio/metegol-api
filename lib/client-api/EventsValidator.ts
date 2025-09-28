/**
 * EventsValidator - Validates match events consistency and triggers API fallback when needed
 * Ensures that matches with goals have corresponding goal events
 */

import type { Match, TeamMatchEvents } from "@/types/match";

export class EventsValidator {
  constructor() {
    // No need for API dependency - the API will call the fix methods
  }

  /**
   * Validates if a match has consistent events for its goals
   * Returns true if events are consistent, false if validation fails
   */
  validateMatchEvents(match: Match): boolean {
    const officialGoals = {
      home: match.goals.home,
      away: match.goals.away,
    };

    // If no goals, no validation needed
    if (officialGoals.home === 0 && officialGoals.away === 0) {
      return true;
    }

    // Check if events exist
    if (!match.events || (!match.events.home && !match.events.away)) {
      console.warn(
        `⚠️ EVENTS VALIDATION: Match ${match.fixture.id} has goals but no events data`
      );
      return false;
    }

    // Count goal events (excluding missed penalties from penalty shootouts)
    const homeGoalEvents =
      match.events.home?.filter(
        e =>
          e.type === "Goal" &&
          !(e.detail === "Missed Penalty" && e.comments === "Penalty Shootout")
      ) || [];

    const awayGoalEvents =
      match.events.away?.filter(
        e =>
          e.type === "Goal" &&
          !(e.detail === "Missed Penalty" && e.comments === "Penalty Shootout")
      ) || [];

    const eventGoals = {
      home: homeGoalEvents.length,
      away: awayGoalEvents.length,
    };

    // Compare official goals with event goals
    const isConsistent =
      officialGoals.home === eventGoals.home &&
      officialGoals.away === eventGoals.away;

    if (!isConsistent) {
      console.warn(
        `⚠️ EVENTS VALIDATION: Match ${match.fixture.id} has inconsistent goals:`,
        {
          officialGoals,
          eventGoals,
          difference: {
            home: officialGoals.home - eventGoals.home,
            away: officialGoals.away - eventGoals.away,
          },
        }
      );
    }

    return isConsistent;
  }

  /**
   * Fixes match events by fetching missing data from API
   * Returns updated match with corrected events
   * NOTE: This method expects the API instance to be passed to avoid circular dependencies
   */
  async fixMatchEvents(
    match: Match,
    getMatchEventsFunc: (
      matchId: number
    ) => Promise<{ home: TeamMatchEvents; away: TeamMatchEvents } | null>
  ): Promise<Match> {
    try {
      console.log(
        `🔧 EVENTS FIX: Attempting to fix events for match ${match.fixture.id}`
      );

      // Fetch fresh events from API (this will trigger the fallback mechanism)
      const freshEvents = await getMatchEventsFunc(match.fixture.id);

      if (freshEvents) {
        console.log(
          `✅ EVENTS FIX: Successfully fetched events for match ${match.fixture.id}`
        );

        // Return match with updated events
        return {
          ...match,
          events: freshEvents,
        };
      } else {
        console.warn(
          `⚠️ EVENTS FIX: No events found for match ${match.fixture.id}`
        );
        return match;
      }
    } catch (error) {
      console.error(
        `❌ EVENTS FIX: Failed to fix events for match ${match.fixture.id}:`,
        error
      );
      return match;
    }
  }

  /**
   * Validates multiple matches and returns which ones need fixing
   */
  getMatchesNeedingFix(matches: Match[]): Match[] {
    return matches.filter(match => {
      const shouldValidate =
        (match.goals.home > 0 || match.goals.away > 0) &&
        ["FT", "AET", "PEN", "1H", "2H", "LIVE", "ET", "P", "HT"].includes(
          match.fixture.status.short
        );

      if (!shouldValidate) {
        return false;
      }

      return !this.validateMatchEvents(match);
    });
  }

  /**
   * Bulk fix multiple matches with inconsistent events
   */
  async bulkFixMatches(
    matches: Match[],
    getMatchEventsFunc: (
      matchId: number
    ) => Promise<{ home: TeamMatchEvents; away: TeamMatchEvents } | null>
  ): Promise<Match[]> {
    const matchesNeedingFix = this.getMatchesNeedingFix(matches);

    if (matchesNeedingFix.length === 0) {
      console.log("✅ BULK FIX: All matches have consistent events");
      return matches;
    }

    console.log(
      `🔧 BULK FIX: Fixing ${matchesNeedingFix.length} matches with inconsistent events`
    );

    const fixedMatches = new Map<number, Match>();

    // Fix matches one by one with small delays to respect rate limits
    for (const match of matchesNeedingFix) {
      try {
        const fixedMatch = await this.fixMatchEvents(match, getMatchEventsFunc);
        fixedMatches.set(match.fixture.id, fixedMatch);

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `❌ BULK FIX: Failed to fix match ${match.fixture.id}:`,
          error
        );
      }
    }

    // Return original matches array with fixed matches replaced
    return matches.map(match => {
      const fixedMatch = fixedMatches.get(match.fixture.id);
      return fixedMatch || match;
    });
  }
}
