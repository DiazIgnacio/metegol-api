import { NextRequest, NextResponse } from "next/server";
import { DataSyncer } from "@/lib/background-sync/DataSyncer";

// This endpoint will be called by cron services like Vercel Cron or external schedulers
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // Get authorization header to secure the cron endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕒 CRON: Starting scheduled sync");

    const syncer = new DataSyncer(apiKey);

    // Run smart sync based on current time
    await syncer.smartSync();

    const stats = syncer.getStats();

    return NextResponse.json({
      success: true,
      message: "Scheduled sync completed",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json({ error: "Cron sync failed" }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Cron sync endpoint is healthy",
    timestamp: new Date().toISOString(),
  });
}
