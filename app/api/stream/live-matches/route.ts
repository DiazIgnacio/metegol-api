// Real-time live matches streaming endpoint
import { NextRequest, NextResponse } from "next/server";
import { FastFootballApi } from "@/lib/client-api/FastFootballApi";
import { DataSyncer } from "@/lib/background-sync/DataSyncer";
// import type { Match } from "@/types/match";

const api = new FastFootballApi();

// Check for live matches every 30 seconds
const LIVE_CHECK_INTERVAL = 30000;

// Global map to track active streams
const activeStreams = new Map<
  string,
  {
    controller: ReadableStreamDefaultController;
    interval: NodeJS.Timeout;
    leagueIds: number[];
  }
>();

// Cleanup inactive streams after 5 minutes
const STREAM_CLEANUP_INTERVAL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leaguesParam = searchParams.get("leagues");

  if (!leaguesParam) {
    return NextResponse.json(
      { error: "leagues parameter is required" },
      { status: 400 }
    );
  }

  const leagueIds = leaguesParam
    .split(",")
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));

  if (leagueIds.length === 0) {
    return NextResponse.json({ error: "Invalid league IDs" }, { status: 400 });
  }

  console.log(`🔴 LIVE STREAM: Starting for leagues [${leagueIds.join(", ")}]`);

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      const streamId = `${Date.now()}_${Math.random()}`;

      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connection",
          message: "Live stream connected",
          timestamp: new Date().toISOString(),
          leagueIds,
        })}\n\n`
      );

      // Function to check for live matches
      const checkLiveMatches = async () => {
        try {
          console.log(`🔄 LIVE STREAM: Checking for live matches...`);

          // Get current live matches
          const liveMatches = await api.getLiveMatches(leagueIds);

          if (liveMatches.length > 0) {
            console.log(
              `🔴 LIVE STREAM: Found ${liveMatches.length} live matches`
            );

            // Force sync live matches to get latest data
            if (process.env.FOOTBALL_API_KEY) {
              try {
                const syncer = new DataSyncer(process.env.FOOTBALL_API_KEY);
                await syncer.forceSync("live");
                console.log(`🔄 LIVE STREAM: Forced sync completed`);
              } catch (syncError) {
                console.warn(`⚠️ LIVE STREAM: Sync failed:`, syncError);
              }
            }

            // Send live matches update
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "live_matches",
                matches: liveMatches,
                count: liveMatches.length,
                timestamp: new Date().toISOString(),
              })}\n\n`
            );
          } else {
            console.log(`⚪ LIVE STREAM: No live matches found`);

            // Send no live matches message
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "no_live_matches",
                message: "No live matches currently",
                timestamp: new Date().toISOString(),
              })}\n\n`
            );
          }
        } catch (error) {
          console.error(`❌ LIVE STREAM: Error checking live matches:`, error);

          controller.enqueue(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date().toISOString(),
            })}\n\n`
          );
        }
      };

      // Initial check
      checkLiveMatches();

      // Set up interval for periodic checks
      const interval = setInterval(checkLiveMatches, LIVE_CHECK_INTERVAL);

      // Store stream info for cleanup
      activeStreams.set(streamId, {
        controller,
        interval,
        leagueIds,
      });

      // Cleanup on stream end
      const cleanup = () => {
        console.log(`🔴 LIVE STREAM: Cleaning up stream ${streamId}`);
        clearInterval(interval);
        activeStreams.delete(streamId);
      };

      // Set up cleanup timeout
      setTimeout(cleanup, STREAM_CLEANUP_INTERVAL);

      // Handle client disconnect
      request.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      console.log(`🔴 LIVE STREAM: Stream cancelled by client`);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// Cleanup function for inactive streams
setInterval(() => {
  for (const [streamId, _streamInfo] of activeStreams.entries()) {
    // Check if stream is still active (this is a simplified check)
    // In a real implementation, you'd track last activity
    console.log(`🧹 CLEANUP: Checking stream ${streamId}`);
  }
}, STREAM_CLEANUP_INTERVAL);

// Health check endpoint
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
