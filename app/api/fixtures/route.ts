import { NextRequest, NextResponse } from "next/server";
import { FastFootballApi } from "@/lib/client-api/FastFootballApi";
import { PRIORITY_LEAGUES } from "@/lib/config/leagues";
import { Match } from "@/types/match";
import { format, parseISO } from "date-fns";
import { zonedTimeToUtc, toZonedTime } from "date-fns-tz";

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
      // Use Argentina timezone (UTC-3) instead of server timezone
      const argTimeZone = "America/Argentina/Buenos_Aires";

      if (inputDate) {
        // If date is provided, parse it in Argentina timezone
        const parsedDate = parseISO(inputDate);
        const zonedDate = toZonedTime(parsedDate, argTimeZone);
        return format(zonedDate, "yyyy-MM-dd");
      } else {
        // For current date, use Argentina current time
        const nowInArg = toZonedTime(new Date(), argTimeZone);
        return format(nowInArg, "yyyy-MM-dd");
      }
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
      // Default leagues for today - usando configuración centralizada + Copa Libertadores
      const todayStr = getDateString(date);
      const allLeagues = [...PRIORITY_LEAGUES, 13]; // Agregar Copa Libertadores (ID: 13)
      matches = await api.getMultipleLeaguesFixtures(todayStr, allLeagues);
    }

    // Filter matches by Argentina date to exclude matches from previous day in UTC
    const filterByArgentinaDate = (matches: Match[], targetDateStr: string) => {
      const argTimeZone = "America/Argentina/Buenos_Aires";

      return matches.filter(match => {
        // Convert match UTC date to Argentina time
        const matchUTCDate = new Date(match.fixture.date);
        const matchArgDate = toZonedTime(matchUTCDate, argTimeZone);
        const matchArgDateStr = format(matchArgDate, "yyyy-MM-dd");

        return matchArgDateStr === targetDateStr;
      });
    };

    // Apply Argentina timezone filter
    const targetDateStr = getDateString(date);
    const filteredMatches = filterByArgentinaDate(matches, targetDateStr);

    // No direct API fallback - let FastFootballApi handle cache/API logic internally

    // Get matches with detailed data (stats, events, lineups) - already cached in Firebase
    const matchesWithStats = await api.getMatchesWithDetails(filteredMatches);

    return NextResponse.json({ matches: matchesWithStats });
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json(
      { error: "Error al obtener los partidos" },
      { status: 500 }
    );
  }
}
