// Simple admin dashboard
import { NextResponse } from "next/server";
import { FirebaseCache } from "@/lib/firebase/cache";
import { withAdminAuth } from "@/lib/middleware/auth";

let globalCache: FirebaseCache | null = null;

export const GET = withAdminAuth(async () => {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Initialize cache if needed
    if (!globalCache) {
      globalCache = FirebaseCache.getInstance();
    }

    // Get basic cache statistics
    const cacheStats = await globalCache.getStats();

    const dashboard = {
      timestamp: new Date().toISOString(),
      summary: {
        cacheEntries: cacheStats.totalEntries,
        expiredEntries: cacheStats.expiredEntries,
        cacheSize: `${Math.round(cacheStats.sizeBytes / 1024)}KB`,
        status:
          cacheStats.expiredEntries > cacheStats.totalEntries * 0.5
            ? "Needs cleanup"
            : "Healthy",
      },
      cache: {
        ...cacheStats,
        sizeMB: Math.round((cacheStats.sizeBytes / 1024 / 1024) * 100) / 100,
      },
      actions: {
        clearExpiredCache: "/api/admin/dashboard?action=clear-expired",
        syncData: "/api/admin/sync",
      },
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to generate dashboard" },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async request => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (!globalCache) {
      globalCache = FirebaseCache.getInstance();
    }

    switch (action) {
      case "clear-expired":
        await globalCache.cleanup();
        return NextResponse.json({
          success: true,
          message: "Expired cache entries cleared",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Dashboard action error:", error);
    return NextResponse.json(
      { error: "Failed to execute action" },
      { status: 500 }
    );
  }
});
