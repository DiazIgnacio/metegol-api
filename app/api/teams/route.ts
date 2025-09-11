import { NextRequest, NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

const footballApi = new FootballApiServer(process.env.FOOTBALL_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const season = parseInt(searchParams.get("season") || "2025");

    // Get all teams from Liga Profesional (league ID: 128)
    const allTeams = await footballApi.getTeams(season);

    // If search parameter exists, filter teams by name
    let teams = allTeams;
    if (search) {
      const searchTerm = search.toLowerCase();
      teams = allTeams.filter(team =>
        team.name.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json({
      teams: teams.slice(0, 10), // Limit to 10 results for dropdown
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
