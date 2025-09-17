import { NextRequest, NextResponse } from "next/server";
import { SmartPreloader } from "@/lib/preloader";

let preloaderInstance: SmartPreloader | null = null;

function getPreloader(): SmartPreloader | null {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  if (!preloaderInstance) {
    preloaderInstance = new SmartPreloader(apiKey);
  }
  return preloaderInstance;
}

export async function POST(request: NextRequest) {
  const preloader = getPreloader();
  if (!preloader) {
    return NextResponse.json(
      { error: "Preloader not available - missing API key" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "preload_today":
        preloader.preloadTodaysMatches();
        return NextResponse.json({
          message: "Started preloading today's matches",
          status: "started",
        });

      case "smart_preload":
        preloader.smartPreload();
        return NextResponse.json({
          message: "Started intelligent preload",
          status: "started",
        });

      case "stop":
        preloader.stop();
        return NextResponse.json({
          message: "Preloader stopped",
          status: "stopped",
        });

      case "clear_queue":
        preloader.clearQueue();
        return NextResponse.json({
          message: "Preload queue cleared",
          status: "cleared",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Preload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  const preloader = getPreloader();
  if (!preloader) {
    return NextResponse.json(
      { error: "Preloader not available - missing API key" },
      { status: 500 }
    );
  }

  try {
    const stats = preloader.getStats();
    return NextResponse.json({
      preloaderStats: stats,
      message: "Preloader statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Preload stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
