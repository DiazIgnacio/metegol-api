import { NextRequest, NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

const footballApi = new FootballApiServer(process.env.FOOTBALL_API_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const season = 2025;
    
    // Get team matches from all leagues
    const matches = await footballApi.getTeamAllMatches(teamId, season);
    
    // Get team info from the first match (contains team data)
    const teamInfo = matches.length > 0 
      ? matches[0].teams.home.id === teamId 
        ? matches[0].teams.home 
        : matches[0].teams.away
      : null;

    if (!teamInfo) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Get match statistics for recent matches (only 10 to improve loading speed)
    const recentMatches = matches.slice(0, 10);
    const matchesWithStats = await Promise.all(
      recentMatches.map(async (match) => {
        const stats = await footballApi.getMatchStats(match);
        const events = await footballApi.getMatchEvents(match);
        return {
          ...match,
          statistics: stats,
          events: events
        };
      })
    );

    // Add stats and events to the first 10 matches, rest without detailed stats
    const allMatchesWithSomeStats = matches.map((match, index) => {
      if (index < 10) {
        return matchesWithStats[index];
      }
      return match;
    });

    return NextResponse.json({
      team: teamInfo,
      matches: allMatchesWithSomeStats,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    );
  }
}