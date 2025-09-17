// Auto Scheduler - Automatically schedules population tasks
import { MassiveDataPopulator } from "./MassiveDataPopulator";
import { DataSyncer } from "./DataSyncer";

interface ScheduleConfig {
  enabled: boolean;
  intervals: {
    quickSync: number; // minutes
    smartSync: number; // minutes
    fullPopulation: number; // hours
  };
  timeWindows: {
    lowActivity: { start: number; end: number }; // hours (24h format)
    highActivity: { start: number; end: number }; // hours (24h format)
  };
  throttling: {
    maxConcurrentOperations: number;
    respectRateLimit: boolean;
  };
}

export class AutoScheduler {
  private config: ScheduleConfig;
  private populator: MassiveDataPopulator;
  private syncer: DataSyncer;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private lastOperations = {
    quickSync: 0,
    smartSync: 0,
    fullPopulation: 0,
  };

  constructor(apiKey: string, config?: Partial<ScheduleConfig>) {
    this.populator = new MassiveDataPopulator(apiKey);
    this.syncer = new DataSyncer(apiKey);

    this.config = {
      enabled: true,
      intervals: {
        quickSync: 30, // Every 30 minutes
        smartSync: 120, // Every 2 hours
        fullPopulation: 24 * 60, // Every 24 hours
      },
      timeWindows: {
        lowActivity: { start: 2, end: 6 }, // 2 AM - 6 AM
        highActivity: { start: 14, end: 22 }, // 2 PM - 10 PM
      },
      throttling: {
        maxConcurrentOperations: 1,
        respectRateLimit: true,
      },
      ...config,
    };
  }

  /**
   * Start the automatic scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("⚠️ SCHEDULER: Already running");
      return;
    }

    this.isRunning = true;
    console.log("🕒 SCHEDULER: Starting automatic population scheduler");
    console.log("📋 SCHEDULER: Configuration:", this.config);

    if (!this.config.enabled) {
      console.log("⏸️ SCHEDULER: Disabled in configuration");
      return;
    }

    this.scheduleOperations();
  }

  /**
   * Stop the automatic scheduler
   */
  stop(): void {
    console.log("🛑 SCHEDULER: Stopping...");
    this.isRunning = false;

    // Clear all intervals
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`⏹️ SCHEDULER: Stopped ${name} interval`);
    });
    this.intervals.clear();

    // Stop ongoing operations
    this.populator.stop();
    this.syncer.stop();
  }

  /**
   * Schedule all operations
   */
  private scheduleOperations(): void {
    // Quick sync - frequent updates
    this.scheduleQuickSync();

    // Smart sync - balanced updates
    this.scheduleSmartSync();

    // Full population - comprehensive updates
    this.scheduleFullPopulation();

    // Health check - monitor and adjust
    this.scheduleHealthCheck();
  }

  /**
   * Schedule quick sync operations
   */
  private scheduleQuickSync(): void {
    const intervalMs = this.config.intervals.quickSync * 60 * 1000;

    const quickSyncInterval = setInterval(() => {
      if (!this.isOperationAllowed("quickSync")) return;

      console.log("⚡ SCHEDULER: Running quick sync...");
      this.lastOperations.quickSync = Date.now();

      // Run smart sync instead of quick population for lighter load
      this.syncer.smartSync().catch(error => {
        console.error("❌ SCHEDULER: Quick sync failed:", error);
      });
    }, intervalMs);

    this.intervals.set("quickSync", quickSyncInterval);
    console.log(
      `⏰ SCHEDULER: Quick sync scheduled every ${this.config.intervals.quickSync} minutes`
    );
  }

  /**
   * Schedule smart sync operations
   */
  private scheduleSmartSync(): void {
    const intervalMs = this.config.intervals.smartSync * 60 * 1000;

    const smartSyncInterval = setInterval(() => {
      if (!this.isOperationAllowed("smartSync")) return;

      console.log("🧠 SCHEDULER: Running smart sync...");
      this.lastOperations.smartSync = Date.now();

      // Run comprehensive smart sync
      this.syncer.smartSync().catch(error => {
        console.error("❌ SCHEDULER: Smart sync failed:", error);
      });
    }, intervalMs);

    this.intervals.set("smartSync", smartSyncInterval);
    console.log(
      `⏰ SCHEDULER: Smart sync scheduled every ${this.config.intervals.smartSync} minutes`
    );
  }

  /**
   * Schedule full population operations
   */
  private scheduleFullPopulation(): void {
    const intervalMs = this.config.intervals.fullPopulation * 60 * 1000;

    const fullPopulationInterval = setInterval(() => {
      if (!this.isOperationAllowed("fullPopulation")) return;

      console.log("🌍 SCHEDULER: Running full population...");
      this.lastOperations.fullPopulation = Date.now();

      // Only run during low activity hours
      const currentHour = new Date().getHours();
      const { lowActivity } = this.config.timeWindows;

      if (currentHour >= lowActivity.start && currentHour <= lowActivity.end) {
        console.log(
          "🌙 SCHEDULER: Low activity window - running full population"
        );
        this.populator.fullPopulation().catch(error => {
          console.error("❌ SCHEDULER: Full population failed:", error);
        });
      } else {
        console.log(
          "☀️ SCHEDULER: High activity time - skipping full population"
        );
        // Run quick population instead
        this.populator.quickPopulation().catch(error => {
          console.error("❌ SCHEDULER: Quick population failed:", error);
        });
      }
    }, intervalMs);

    this.intervals.set("fullPopulation", fullPopulationInterval);
    console.log(
      `⏰ SCHEDULER: Full population scheduled every ${this.config.intervals.fullPopulation / 60} hours`
    );
  }

  /**
   * Schedule health check
   */
  private scheduleHealthCheck(): void {
    const healthCheckInterval = setInterval(
      () => {
        this.performHealthCheck();
      },
      15 * 60 * 1000
    ); // Every 15 minutes

    this.intervals.set("healthCheck", healthCheckInterval);
    console.log("🏥 SCHEDULER: Health check scheduled every 15 minutes");
  }

  /**
   * Check if operation is allowed
   */
  private isOperationAllowed(
    operation: keyof typeof this.lastOperations
  ): boolean {
    if (!this.isRunning || !this.config.enabled) {
      return false;
    }

    // Check concurrent operations
    const populatorStats = this.populator.getStats();
    const syncerStats = this.syncer.getStats();

    const concurrentOps =
      (populatorStats.isRunning ? 1 : 0) +
      (syncerStats.runningJobs > 0 ? 1 : 0);

    if (concurrentOps >= this.config.throttling.maxConcurrentOperations) {
      console.log(
        `⏸️ SCHEDULER: Skipping ${operation} - too many concurrent operations (${concurrentOps})`
      );
      return false;
    }

    // Check rate limiting
    if (this.config.throttling.respectRateLimit) {
      const apiCallsToday =
        syncerStats.apiCallsToday + populatorStats.totalApiCalls;
      if (apiCallsToday > 6000) {
        // Conservative limit
        console.log(
          `⏸️ SCHEDULER: Skipping ${operation} - API rate limit approaching (${apiCallsToday} calls)`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Perform health check and adjustments
   */
  private performHealthCheck(): void {
    const populatorStats = this.populator.getStats();
    const syncerStats = this.syncer.getStats();

    console.log("🏥 SCHEDULER: Health check:", {
      populatorRunning: populatorStats.isRunning,
      syncerJobs: syncerStats.runningJobs,
      apiCallsToday: syncerStats.apiCallsToday + populatorStats.totalApiCalls,
      lastOperations: {
        quickSync: this.formatLastOperation(this.lastOperations.quickSync),
        smartSync: this.formatLastOperation(this.lastOperations.smartSync),
        fullPopulation: this.formatLastOperation(
          this.lastOperations.fullPopulation
        ),
      },
    });

    // Auto-recovery: restart failed operations
    if (populatorStats.failedBatches > 0 && !populatorStats.isRunning) {
      console.log("🔄 SCHEDULER: Auto-recovery - restarting failed population");
      this.populator.quickPopulation().catch(error => {
        console.error("❌ SCHEDULER: Auto-recovery failed:", error);
      });
    }
  }

  /**
   * Format last operation time
   */
  private formatLastOperation(timestamp: number): string {
    if (timestamp === 0) return "Never";
    const minutesAgo = Math.round((Date.now() - timestamp) / (1000 * 60));
    return `${minutesAgo} minutes ago`;
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastOperations: {
        quickSync: this.formatLastOperation(this.lastOperations.quickSync),
        smartSync: this.formatLastOperation(this.lastOperations.smartSync),
        fullPopulation: this.formatLastOperation(
          this.lastOperations.fullPopulation
        ),
      },
      scheduledIntervals: Array.from(this.intervals.keys()),
      populatorStats: this.populator.getStats(),
      syncerStats: this.syncer.getStats(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🔧 SCHEDULER: Configuration updated:", this.config);

    if (this.isRunning) {
      console.log("🔄 SCHEDULER: Restarting with new configuration...");
      this.stop();
      setTimeout(() => this.start(), 2000);
    }
  }
}
