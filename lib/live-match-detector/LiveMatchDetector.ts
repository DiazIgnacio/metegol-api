// Enhanced Live Match Detection - OPTIMIZED for 2025
import { FastFootballApi } from "@/lib/client-api/FastFootballApi";
import { DataSyncer } from "@/lib/background-sync/DataSyncer";
import { FirebaseCache } from "@/lib/firebase/cache";
import { ALL_NAVBAR_LEAGUES } from "@/lib/config/leagues";
import { format } from "date-fns";
import type { Match } from "@/types/match";

interface LiveMatchState {
  matchId: number;
  status: string;
  minute: number | null;
  lastUpdate: number;
  homeScore: number;
  awayScore: number;
  needsUpdate: boolean;
}

export class LiveMatchDetector {
  private api: FastFootballApi;
  private syncer: DataSyncer | null = null;
  private cache: FirebaseCache;
  private liveMatches: Map<number, LiveMatchState> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Default leagues to monitor - ALL leagues from navbar
  private monitoredLeagues: number[] = [...ALL_NAVBAR_LEAGUES];

  constructor() {
    this.api = new FastFootballApi();
    this.cache = FirebaseCache.getInstance();

    // Initialize DataSyncer if API key is available
    if (process.env.FOOTBALL_API_KEY) {
      this.syncer = new DataSyncer(process.env.FOOTBALL_API_KEY);
    }
  }

  /**
   * Start monitoring live matches
   */
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log("🔴 Live match detector already running");
      return;
    }

    this.isRunning = true;
    console.log("🔴 LIVE DETECTOR: Starting live match monitoring...");

    // Initial scan
    await this.scanForLiveMatches();

    // Set up monitoring interval (every 60 seconds)
    this.updateInterval = setInterval(async () => {
      await this.scanForLiveMatches();
    }, 60000);

    console.log("✅ LIVE DETECTOR: Monitoring started");
  }

  /**
   * Stop monitoring live matches
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    this.liveMatches.clear();
    console.log("🔴 LIVE DETECTOR: Monitoring stopped");
  }

  /**
   * Scan for current live matches
   */
  private async scanForLiveMatches(): Promise<void> {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      console.log(`🔍 LIVE DETECTOR: Scanning for live matches on ${today}...`);

      // Get today's matches for all monitored leagues
      const allMatches = await this.api.getMultipleLeaguesFixtures(
        today,
        this.monitoredLeagues
      );

      // Filter live matches
      const liveMatches = allMatches.filter(match =>
        ["1H", "2H", "HT", "LIVE", "ET", "P"].includes(
          match.fixture.status.short
        )
      );

      console.log(`🔴 LIVE DETECTOR: Found ${liveMatches.length} live matches`);

      if (liveMatches.length > 0) {
        await this.updateLiveMatchStates(liveMatches);
        await this.triggerLiveUpdates(liveMatches);
      } else {
        // No live matches, clear state
        this.liveMatches.clear();
        console.log("⚪ LIVE DETECTOR: No live matches found");
      }
    } catch (error) {
      console.error(
        "❌ LIVE DETECTOR: Error scanning for live matches:",
        error
      );
    }
  }

  /**
   * Update internal state of live matches
   */
  private async updateLiveMatchStates(matches: Match[]): Promise<void> {
    const currentTime = Date.now();

    for (const match of matches) {
      const matchId = match.fixture.id;
      const currentState = this.liveMatches.get(matchId);

      const newState: LiveMatchState = {
        matchId,
        status: match.fixture.status.short,
        minute: match.fixture.status.elapsed || null,
        lastUpdate: currentTime,
        homeScore: match.goals?.home || 0,
        awayScore: match.goals?.away || 0,
        needsUpdate: true,
      };

      // Check if match state has changed
      if (currentState) {
        const scoreChanged =
          currentState.homeScore !== newState.homeScore ||
          currentState.awayScore !== newState.awayScore;

        const statusChanged = currentState.status !== newState.status;
        const minuteChanged = currentState.minute !== newState.minute;

        newState.needsUpdate = scoreChanged || statusChanged || minuteChanged;

        if (newState.needsUpdate) {
          console.log(`🔄 LIVE DETECTOR: Match ${matchId} changed:`, {
            scoreChanged,
            statusChanged,
            minuteChanged,
            from: currentState,
            to: newState,
          });
        }
      } else {
        console.log(`🆕 LIVE DETECTOR: New live match detected: ${matchId}`);
      }

      this.liveMatches.set(matchId, newState);
    }

    // Remove matches that are no longer live
    const currentLiveIds = new Set(matches.map(m => m.fixture.id));
    for (const [matchId, _state] of this.liveMatches.entries()) {
      if (!currentLiveIds.has(matchId)) {
        console.log(
          `✅ LIVE DETECTOR: Match ${matchId} is no longer live, removing from monitoring`
        );
        this.liveMatches.delete(matchId);
      }
    }
  }

  /**
   * Trigger updates for live matches that need it
   */
  private async triggerLiveUpdates(matches: Match[]): Promise<void> {
    if (!this.syncer) {
      console.warn("⚠️ LIVE DETECTOR: No syncer available, skipping updates");
      return;
    }

    const matchesNeedingUpdate = matches.filter(match => {
      const state = this.liveMatches.get(match.fixture.id);
      return state?.needsUpdate === true;
    });

    if (matchesNeedingUpdate.length === 0) {
      console.log("✅ LIVE DETECTOR: No matches need updates");
      return;
    }

    console.log(
      `🔄 LIVE DETECTOR: Triggering updates for ${matchesNeedingUpdate.length} matches`
    );

    try {
      // Force sync live matches to get latest data
      await this.syncer.forceSync("live");

      // Mark matches as updated
      for (const match of matchesNeedingUpdate) {
        const state = this.liveMatches.get(match.fixture.id);
        if (state) {
          state.needsUpdate = false;
          state.lastUpdate = Date.now();
        }
      }

      console.log("✅ LIVE DETECTOR: Live match updates completed");
    } catch (error) {
      console.error("❌ LIVE DETECTOR: Error updating live matches:", error);
    }
  }

  /**
   * Get current live match states
   */
  getCurrentLiveMatches(): LiveMatchState[] {
    return Array.from(this.liveMatches.values());
  }

  /**
   * Get live match count
   */
  getLiveMatchCount(): number {
    return this.liveMatches.size;
  }

  /**
   * Check if a specific match is being monitored as live
   */
  isMatchLive(matchId: number): boolean {
    return this.liveMatches.has(matchId);
  }

  /**
   * Get statistics about the detector
   */
  getStats(): {
    isRunning: boolean;
    liveMatchCount: number;
    lastScanTime: number | null;
    monitoredLeagues: number[];
  } {
    return {
      isRunning: this.isRunning,
      liveMatchCount: this.liveMatches.size,
      lastScanTime:
        this.liveMatches.size > 0
          ? Math.max(
              ...Array.from(this.liveMatches.values()).map(m => m.lastUpdate)
            )
          : null,
      monitoredLeagues: this.monitoredLeagues,
    };
  }

  /**
   * Force an immediate scan (useful for testing or manual triggers)
   */
  async forceScan(): Promise<void> {
    console.log("🔄 LIVE DETECTOR: Forcing immediate scan...");
    await this.scanForLiveMatches();
  }

  /**
   * Add a league to monitoring
   */
  addLeague(leagueId: number): void {
    if (!this.monitoredLeagues.includes(leagueId)) {
      this.monitoredLeagues.push(leagueId);
      console.log(`➕ LIVE DETECTOR: Added league ${leagueId} to monitoring`);
    }
  }

  /**
   * Remove a league from monitoring
   */
  removeLeague(leagueId: number): void {
    const index = this.monitoredLeagues.indexOf(leagueId);
    if (index > -1) {
      this.monitoredLeagues.splice(index, 1);
      console.log(
        `➖ LIVE DETECTOR: Removed league ${leagueId} from monitoring`
      );
    }
  }
}

// Global instance for singleton pattern
let globalDetector: LiveMatchDetector | null = null;

export function getLiveMatchDetector(): LiveMatchDetector {
  if (!globalDetector) {
    globalDetector = new LiveMatchDetector();
  }
  return globalDetector;
}
