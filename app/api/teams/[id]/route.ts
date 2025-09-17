import { NextRequest, NextResponse } from "next/server";
import { FastFootballApi } from "@/lib/client-api/FastFootballApi";

// Global instance to avoid Firebase reinitialization
let globalApi: FastFootballApi | null = null;

function getApi(): FastFootballApi {
  if (!globalApi) {
    globalApi = new FastFootballApi();
  }
  return globalApi;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const season = 2025;

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FOOTBALL_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use FootballApiServer for team matches
    const { FootballApiServer } = await import("@/lib/footballApi");
    const externalApi = new FootballApiServer(apiKey);

    // Get team matches from all leagues using getTeamAllMatches
    console.log(`📄 Fetching all matches for team ${teamId}, season ${season}`);
    const allMatches = await externalApi.getTeamAllMatches(teamId, season);

    if (!allMatches || allMatches.length === 0) {
      return NextResponse.json({
        team: {
          id: teamId,
          name: `Team ${teamId}`,
          logo: `https://media.api-sports.io/football/teams/${teamId}.png`,
        },
        matches: [],
        totalMatches: 0,
      });
    }

    // Get team info from the first match
    const firstMatch = allMatches[0];
    const teamInfo =
      firstMatch.teams.home.id === teamId
        ? firstMatch.teams.home
        : firstMatch.teams.away;

    // Sort matches: upcoming first, then recent finished matches
    const now = new Date();
    const sortedMatches = allMatches.sort((a, b) => {
      const dateA = new Date(a.fixture.date);
      const dateB = new Date(b.fixture.date);

      // Separate upcoming and past matches
      const aIsUpcoming =
        dateA > now || ["NS", "TBD", "PST"].includes(a.fixture.status.short);
      const bIsUpcoming =
        dateB > now || ["NS", "TBD", "PST"].includes(b.fixture.status.short);

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Within same category, sort by date
      if (aIsUpcoming) {
        return dateA.getTime() - dateB.getTime(); // Upcoming: earliest first
      } else {
        return dateB.getTime() - dateA.getTime(); // Past: most recent first
      }
    });

    // Get detailed data for first 10 matches only (to improve performance)
    const api = getApi();
    const recentMatches = sortedMatches.slice(0, 10);
    const matchesWithStats = await Promise.all(
      recentMatches.map(async match => {
        try {
          const [stats, events] = await Promise.all([
            api.getMatchStats(match.fixture.id),
            api.getMatchEvents(match.fixture.id),
          ]);

          return {
            ...match,
            statistics: stats,
            events: events,
          };
        } catch (error) {
          console.error(
            `Error getting details for match ${match.fixture.id}:`,
            error
          );
          return match; // Return match without detailed stats if there's an error
        }
      })
    );

    // Combine detailed matches with the rest
    const allMatchesWithSomeStats = sortedMatches.map((match, index) => {
      if (index < 10) {
        return matchesWithStats[index];
      }
      return match;
    });

    return NextResponse.json({
      team: teamInfo,
      matches: allMatchesWithSomeStats,
      totalMatches: allMatches.length,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    );
  }
}
