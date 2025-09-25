// Simplified Firebase cache service
import { adminDb } from "./config";
import type { Match } from "@/types/match";

interface CacheDocument {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  lastModified?: number; // For incremental updates
  dataHash?: string; // To detect changes
}

// interface ChangeDetectionMeta {
//   lastCheck: number;
//   changedItems: string[];
// }

export class FirebaseCache {
  private static instance: FirebaseCache;
  private readonly collectionName = "api_cache";
  private readonly changesCollectionName = "cache_changes";

  static getInstance(): FirebaseCache {
    if (!FirebaseCache.instance) {
      FirebaseCache.instance = new FirebaseCache();
    }
    return FirebaseCache.instance;
  }

  private generateCacheKey(collection: string, params: any): string {
    const baseKey = `${collection}_${JSON.stringify(params)}`;
    return baseKey
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .substring(0, 100);
  }

  async get<T>(collection: string, params: any): Promise<T | null> {
    try {
      const key = this.generateCacheKey(collection, params);
      const doc = await adminDb.collection(this.collectionName).doc(key).get();

      if (!doc.exists) {
        return null;
      }

      const cacheDoc = doc.data() as CacheDocument;

      // Check if cache has expired
      if (Date.now() > cacheDoc.timestamp + cacheDoc.ttl) {
        console.log(`⏰ Cache EXPIRED for ${key}`);
        return null;
      }

      console.log(`✅ Cache HIT for ${key}`);
      return cacheDoc.data as T;
    } catch (error) {
      console.error(`❌ Cache GET error for ${collection}:`, error);
      return null;
    }
  }

  async set<T>(
    collection: string,
    params: any,
    data: T,
    ttlMinutes: number = 60
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(collection, params);
      const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds

      const cacheDoc: CacheDocument = {
        data: data,
        timestamp: Date.now(),
        ttl: ttl,
        key: key,
        lastModified: Date.now(),
      };

      await adminDb.collection(this.collectionName).doc(key).set(cacheDoc);

      console.log(`💾 Cache SET for ${key} (TTL: ${ttlMinutes}m)`);
    } catch (error) {
      console.error(`❌ Cache SET error for ${collection}:`, error);
    }
  }

  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    sizeBytes: number;
  }> {
    try {
      const snapshot = await adminDb.collection(this.collectionName).get();
      let totalEntries = 0;
      let expiredEntries = 0;
      let sizeBytes = 0;

      snapshot.forEach(doc => {
        totalEntries++;
        const data = doc.data() as CacheDocument;

        // Estimate size
        sizeBytes += JSON.stringify(data).length;

        // Check if expired
        if (Date.now() > data.timestamp + data.ttl) {
          expiredEntries++;
        }
      });

      return {
        totalEntries,
        expiredEntries,
        sizeBytes,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { totalEntries: 0, expiredEntries: 0, sizeBytes: 0 };
    }
  }

  async cleanup(): Promise<void> {
    try {
      console.log("🧹 Starting cache cleanup...");
      const snapshot = await adminDb.collection(this.collectionName).get();
      const batch = adminDb.batch();
      let deletedCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data() as CacheDocument;
        if (Date.now() > data.timestamp + data.ttl) {
          batch.delete(doc.ref);
          deletedCount++;
        }
      });

      await batch.commit();
      console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
    } catch (error) {
      console.error("Error during cache cleanup:", error);
    }
  }
}

// TTL constants (in minutes) - OPTIMIZED for 2025
export const CACHE_TTL = {
  // Live matches - ultra short TTL for real-time updates
  LIVE_FIXTURES: 1, // 1 minute for live matches
  LIVE_STATS: 1, // 1 minute for live stats
  LIVE_EVENTS: 1, // 1 minute for live events

  // Recent finished matches (within last 2 hours) - short TTL
  RECENTLY_FINISHED: 30, // 30 minutes

  // Future matches - moderate TTL
  FUTURE_FIXTURES: 120, // 2 hours

  // Past matches - long TTL
  PAST_FIXTURES: 1440, // 24 hours

  // Static data - very long TTL
  TEAMS: 10080, // 1 week
  LEAGUES: 10080, // 1 week
  LINEUPS: 43200, // 30 days

  // Match details based on status
  FINISHED_STATS: 1440, // 24 hours
  FINISHED_EVENTS: 1440, // 24 hours
} as const;

/**
 * Calculate dynamic TTL based on match status and date - ENHANCED for 2025
 */
export function calculateDynamicTTL(matches: Match[]): number {
  if (!matches.length) return CACHE_TTL.FUTURE_FIXTURES;

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Check for live matches first (highest priority)
  const hasLiveMatches = matches.some(match =>
    ["1H", "2H", "HT", "LIVE", "ET", "P"].includes(
      match.fixture?.status?.short || ""
    )
  );

  if (hasLiveMatches) {
    console.log(
      `🔴 LIVE TTL: Using ${CACHE_TTL.LIVE_FIXTURES} minutes for live matches`
    );
    return CACHE_TTL.LIVE_FIXTURES;
  }

  // Check for recently finished matches (within last 2 hours)
  const hasRecentlyFinished = matches.some(match => {
    if (!match.fixture?.date) return false;
    const matchDate = new Date(match.fixture.date);
    return (
      matchDate > twoHoursAgo &&
      ["FT", "AET", "PEN", "AWD", "WO"].includes(
        match.fixture?.status?.short || ""
      )
    );
  });

  if (hasRecentlyFinished) {
    console.log(
      `⏰ RECENT TTL: Using ${CACHE_TTL.RECENTLY_FINISHED} minutes for recently finished matches`
    );
    return CACHE_TTL.RECENTLY_FINISHED;
  }

  // Check if matches are in the past (long cache)
  const allPast = matches.every(match => {
    if (!match.fixture?.date) return false;
    const matchDate = new Date(match.fixture.date);
    return matchDate < twoHoursAgo;
  });

  if (allPast) {
    console.log(
      `📚 PAST TTL: Using ${CACHE_TTL.PAST_FIXTURES} minutes for past matches`
    );
    return CACHE_TTL.PAST_FIXTURES;
  }

  // Future matches
  console.log(
    `🔮 FUTURE TTL: Using ${CACHE_TTL.FUTURE_FIXTURES} minutes for future matches`
  );
  return CACHE_TTL.FUTURE_FIXTURES;
}

/**
 * Get TTL for individual match based on its status - NEW for 2025
 */
export function getMatchTTL(match: Match): number {
  const status = match.fixture?.status?.short || "NS";
  const now = new Date();
  const matchDate = new Date(match.fixture?.date || now);
  const timeSinceMatch = now.getTime() - matchDate.getTime();
  const twoHours = 2 * 60 * 60 * 1000;

  // Live matches - very short TTL
  if (["1H", "2H", "HT", "LIVE", "ET", "P"].includes(status)) {
    return CACHE_TTL.LIVE_FIXTURES;
  }

  // Recently finished matches (within 2 hours)
  if (
    ["FT", "AET", "PEN", "AWD", "WO"].includes(status) &&
    timeSinceMatch < twoHours
  ) {
    return CACHE_TTL.RECENTLY_FINISHED;
  }

  // Old finished matches
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(status)) {
    return CACHE_TTL.PAST_FIXTURES;
  }

  // Future matches
  return CACHE_TTL.FUTURE_FIXTURES;
}
