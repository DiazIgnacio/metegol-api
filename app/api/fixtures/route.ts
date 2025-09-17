import { NextRequest, NextResponse } from "next/server";
import { FastFootballApi } from "@/lib/client-api/FastFootballApi";
import { Match } from "@/types/match";
import { format, parseISO } from "date-fns";

// Global instance to avoid Firebase reinitialization
let globalApi: FastFootballApi | null = null;

function getApi(): FastFootballApi {
  if (!globalApi) {
    globalApi = new FastFootballApi();
  }
  return globalApi;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const league = searchParams.get("league");
  const leagues = searchParams.get("leagues");

  const api = getApi();

  try {
    let matches: Match[] = [];

    const getDateString = (inputDate?: string | null) => {
      const targetDate = inputDate ? parseISO(inputDate) : new Date();
      return format(targetDate, "yyyy-MM-dd");
    };

    if (leagues) {
      // Multiple leagues - optimized single call
      const leagueIds = leagues.split(",").map(id => parseInt(id.trim()));
      const targetDateStr = getDateString(date);

      matches = await api.getMultipleLeaguesFixtures(targetDateStr, leagueIds);
    } else if (date && league) {
      // Single league and date
      const targetDateStr = getDateString(date);
      matches = await api.getFixturesByDateRangeAndLeague(
        targetDateStr,
        targetDateStr,
        parseInt(league)
      );
    } else if (league) {
      // Single league, today's matches
      const todayStr = getDateString();
      matches = await api.getFixturesByDateRangeAndLeague(
        todayStr,
        todayStr,
        parseInt(league)
      );
    } else {
      // Default leagues for today
      const todayStr = getDateString(date);
      const defaultLeagues = [
        128,
        129,
        130, // Argentina (Liga Profesional, Primera Nacional, Copa Argentina)
        2,
        3,
        848, // UEFA (Champions, Europa, Conference)
        140,
        39,
        135,
        78,
        61, // Top 5 European leagues
        13,
        11, // CONMEBOL (Libertadores, Sudamericana)
        71,
        73, // Brazil (Brasileirão A, Copa do Brasil)
        15, // Mundial de Clubes
      ];
      matches = await api.getMultipleLeaguesFixtures(todayStr, defaultLeagues);
    }

    // Get matches with detailed data (stats, events, lineups) - already cached in Firebase
    const matchesWithStats = await api.getMatchesWithDetails(matches);

    return NextResponse.json({ matches: matchesWithStats });
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json(
      { error: "Error al obtener los partidos" },
      { status: 500 }
    );
  }
}
