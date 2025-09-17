import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STATIC_LEAGUES } from "@/lib/leagues-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");

    // Use the static leagues from SubNavbar component
    let leagues = STATIC_LEAGUES;

    if (country) {
      // Filter by country if requested
      leagues = STATIC_LEAGUES.filter(
        league => league.country.toLowerCase() === country.toLowerCase()
      );
    }

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error("Leagues API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
