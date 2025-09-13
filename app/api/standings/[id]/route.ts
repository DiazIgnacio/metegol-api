import { NextRequest, NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = parseInt(params.id);

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

    const api = new FootballApiServer(apiKey);

    // Obtener el año actual para la temporada
    const currentYear = new Date().getFullYear();

    // Obtener standings
    const standingsResponse = await api.getStandings(leagueId, currentYear);

    // Obtener información de la liga
    const leaguesResponse = await api.getLeagues();
    const leagueInfo = leaguesResponse.find(
      (l: { league: { id: number } }) => l.league.id === leagueId
    );

    if (!standingsResponse || standingsResponse.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron datos de la liga" },
        { status: 404 }
      );
    }

    // Formatear los datos
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
      id: leagueInfo?.league?.id || leagueId,
      name: leagueInfo?.league?.name || `Liga ${leagueId}`,
      logo: leagueInfo?.league?.logo || "",
      country: leagueInfo?.country?.name || "",
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
