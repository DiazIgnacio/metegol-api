import { NextRequest, NextResponse } from "next/server";
import { DataSyncer } from "@/lib/background-sync/DataSyncer";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (optional security check)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FOOTBALL_API_KEY not configured" },
        { status: 500 }
      );
    }

    const syncer = new DataSyncer(apiKey);

    console.log("🔄 Starting scheduled cache refresh...");

    // Use the smart sync functionality that adapts based on time of day
    await syncer.smartSync();

    // Get sync stats
    const syncStats = syncer.getStats();

    console.log("✅ Cache refresh completed!");

    return NextResponse.json({
      success: true,
      message: "Smart sync completed using DataSyncer",
      syncStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh cache",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow POST requests for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
