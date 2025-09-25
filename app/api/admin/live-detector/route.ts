// Live Match Detector Admin API
import { NextRequest, NextResponse } from "next/server";
import { getLiveMatchDetector } from "@/lib/live-match-detector/LiveMatchDetector";

export async function GET(_request: NextRequest) {
  try {
    const detector = getLiveMatchDetector();
    const stats = detector.getStats();
    const liveMatches = detector.getCurrentLiveMatches();

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        liveMatches,
      },
    });
  } catch (error) {
    console.error("Error getting live detector stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get detector stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, leagueId } = body;

    const detector = getLiveMatchDetector();

    switch (action) {
      case "start":
        await detector.startMonitoring();
        return NextResponse.json({
          success: true,
          message: "Live match monitoring started",
        });

      case "stop":
        detector.stopMonitoring();
        return NextResponse.json({
          success: true,
          message: "Live match monitoring stopped",
        });

      case "scan":
        await detector.forceScan();
        return NextResponse.json({
          success: true,
          message: "Force scan completed",
        });

      case "add_league":
        if (!leagueId || typeof leagueId !== "number") {
          return NextResponse.json(
            {
              success: false,
              error: "leagueId is required and must be a number",
            },
            { status: 400 }
          );
        }
        detector.addLeague(leagueId);
        return NextResponse.json({
          success: true,
          message: `League ${leagueId} added to monitoring`,
        });

      case "remove_league":
        if (!leagueId || typeof leagueId !== "number") {
          return NextResponse.json(
            {
              success: false,
              error: "leagueId is required and must be a number",
            },
            { status: 400 }
          );
        }
        detector.removeLeague(leagueId);
        return NextResponse.json({
          success: true,
          message: `League ${leagueId} removed from monitoring`,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in live detector admin:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
