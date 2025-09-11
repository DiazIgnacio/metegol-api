import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const api = new FootballApiServer(apiKey);

    if (country) {
      const leagues = await api.getLeaguesByCountry(country);
      return NextResponse.json({ leagues });
    }

    return NextResponse.json({ leagues: [] });
  } catch (error) {
    console.error("Leagues API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
