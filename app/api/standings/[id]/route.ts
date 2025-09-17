import { NextRequest, NextResponse } from "next/server";
import { STATIC_LEAGUES } from "@/lib/leagues-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leagueId = parseInt(id);

    if (!leagueId || isNaN(leagueId)) {
      return NextResponse.json(
        { error: "ID de liga inválido" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key no configurada" },
        { status: 500 }
      );
    }

    // Use FootballApiServer for standings
    const { FootballApiServer } = await import("@/lib/footballApi");
    const externalApi = new FootballApiServer(apiKey);

    // Get current year for season
    const currentYear = new Date().getFullYear();

    console.log(
      `📄 Fetching standings for league ${leagueId}, season ${currentYear}`
    );

    // Get standings from external API
    const standingsResponse = await externalApi.getStandings(
      leagueId,
      currentYear
    );

    if (!standingsResponse || standingsResponse.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron datos de la liga" },
        { status: 404 }
      );
    }

    // Get league info from STATIC_LEAGUES
    const leagueInfo = STATIC_LEAGUES.find(l => l.id === leagueId);

    // Format the data
    const standings = standingsResponse[0]?.league?.standings?.[0] || [];

    const formattedStandings = standings.map(
      (team: {
        rank: number;
        team: { id: number; name: string; logo: string };
        points: number;
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: { for: number; against: number };
        };
        form?: string;
      }) => ({
        rank: team.rank,
        team: {
          id: team.team.id,
          name: team.team.name,
          logo: team.team.logo,
        },
        points: team.points,
        played: team.all.played,
        win: team.all.win,
        draw: team.all.draw,
        lose: team.all.lose,
        goals: {
          for: team.all.goals.for,
          against: team.all.goals.against,
        },
        form: team.form || "",
      })
    );

    const league = {
      id: standingsResponse[0]?.league?.id || leagueId,
      name:
        leagueInfo?.name ||
        standingsResponse[0]?.league?.name ||
        `Liga ${leagueId}`,
      logo:
        leagueInfo?.logo ||
        `https://media.api-sports.io/football/leagues/${leagueId}.png`,
      country: leagueInfo?.country || "",
      season: standingsResponse[0]?.league?.season || currentYear,
    };

    return NextResponse.json({
      standings: formattedStandings,
      league,
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
