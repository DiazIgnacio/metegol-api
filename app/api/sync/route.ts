import { NextRequest, NextResponse } from "next/server";
import { DataSyncer } from "@/lib/background-sync/DataSyncer";

let syncerInstance: DataSyncer | null = null;

function getSyncer(): DataSyncer | null {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  if (!syncerInstance) {
    syncerInstance = new DataSyncer(apiKey);
  }
  return syncerInstance;
}

export async function POST(request: NextRequest) {
  const syncer = getSyncer();
  if (!syncer) {
    return NextResponse.json(
      { error: "Syncer not available - missing API key" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "sync_today":
        syncer.syncTodaysData();
        return NextResponse.json({
          message: "Started syncing today's data",
          status: "started",
        });

      case "smart_sync":
        syncer.smartSync();
        return NextResponse.json({
          message: "Started intelligent sync",
          status: "started",
        });

      case "force_sync":
        const { type } = body;
        if (!["today", "yesterday", "tomorrow", "live"].includes(type)) {
          return NextResponse.json(
            {
              error: "Invalid sync type. Use: today, yesterday, tomorrow, live",
            },
            { status: 400 }
          );
        }
        syncer.forceSync(type);
        return NextResponse.json({
          message: `Started force sync for ${type}`,
          status: "started",
        });

      case "stop":
        syncer.stop();
        return NextResponse.json({
          message: "Syncer stopped",
          status: "stopped",
        });

      case "clear_queue":
        syncer.clearQueue();
        return NextResponse.json({
          message: "Sync queue cleared",
          status: "cleared",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const syncer = getSyncer();
  if (!syncer) {
    return NextResponse.json(
      { error: "Syncer not available - missing API key" },
      { status: 500 }
    );
  }

  try {
    const stats = syncer.getStats();
    return NextResponse.json({
      syncStats: stats,
      message: "Sync statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Sync stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
