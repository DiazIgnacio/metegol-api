import { NextRequest, NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") || "2025-09-17";
  const league = searchParams.get("league") || "128";

  console.log(`🧪 TESTING FALLBACK: ${date}, league ${league}`);

  try {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 500 });
    }

    const api = new FootballApiServer(apiKey);
    const data = await api.getFixturesByDateAndLeague(date, parseInt(league));

    console.log(`✅ DIRECT API RESULT: Found ${data.length} matches`);

    return NextResponse.json({
      success: true,
      date,
      league,
      matches: data.length,
      sample: data.slice(0, 2), // Just first 2 matches for testing
    });
  } catch (error) {
    console.error("❌ DIRECT API ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
