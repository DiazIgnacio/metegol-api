import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        // Return basic stats since FastFootballApi doesn't have the same call tracking
        return NextResponse.json({
          success: true,
          callStats: {
            message: "Cache stats not available in FastFootballApi",
            totalCalls: 0,
            hitRate: 0,
          },
        });

      case "clear-expired":
        // Basic response since FastFootballApi uses Firebase caching
        return NextResponse.json({
          success: true,
          message:
            "Cache clear not implemented in FastFootballApi - uses Firebase TTL",
        });

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use ?action=stats or ?action=clear-expired",
        });
    }
  } catch (error) {
    console.error("Cache API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message:
        "Cache refresh not implemented in FastFootballApi - uses automatic Firebase caching",
    });
  } catch (error) {
    console.error("Cache refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}
