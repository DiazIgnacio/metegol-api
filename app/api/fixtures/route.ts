import { NextRequest, NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";
import { Match } from "@/types/match";
import { format, subDays, addDays, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const league = searchParams.get('league');
    const leagues = searchParams.get('leagues');

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "No se encontró la clave de API" }, { status: 500 });
    }

    const api = new FootballApiServer(apiKey);

    try {
        let matches: Match[] = [];

        const getDateString = (inputDate?: string) => {
            const targetDate = inputDate ? parseISO(inputDate) : new Date();
            return format(targetDate, 'yyyy-MM-dd');
        };

        if (leagues) {
            const leagueIds = leagues.split(',').map(id => parseInt(id.trim()));

            let fromDateStr, toDateStr;

            if (date) {
                const targetDate = parseISO(date);
                const fromDate = subDays(targetDate, 3);
                const toDate = addDays(targetDate, 3);

                fromDateStr = format(fromDate, 'yyyy-MM-dd');
                toDateStr = format(toDate, 'yyyy-MM-dd');
            } else {
                const today = new Date();
                const weekAgo = subDays(today, 3);

                fromDateStr = format(weekAgo, 'yyyy-MM-dd');
                toDateStr = format(today, 'yyyy-MM-dd');
            }

            const leagueMatches = await Promise.all(
                leagueIds.map(async (leagueId) => { // All provided leagues
                    try {
                        const leagueMatches = await api.getFixturesByDateRangeAndLeague(fromDateStr, toDateStr, leagueId);

                        let filteredMatches = leagueMatches;
                        if (date) {
                            const selectedDateStr = getDateString(date);
                            filteredMatches = leagueMatches.filter(match => {
                                const matchDateStr = getDateString(match.fixture.date);
                                return matchDateStr === selectedDateStr;
                            });
                        }

                        filteredMatches.sort((a, b) => {
                            const aFinished = a.fixture.status.short === "FT" || a.fixture.status.short === "AET" || a.fixture.status.short === "PEN" || a.fixture.status.short === "AWD" || a.fixture.status.short === "WO";
                            const bFinished = b.fixture.status.short === "FT" || b.fixture.status.short === "AET" || b.fixture.status.short === "PEN" || b.fixture.status.short === "AWD" || b.fixture.status.short === "WO";

                            if (aFinished && !bFinished) return -1;
                            if (!aFinished && bFinished) return 1;
                            return new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime();
                        });

                        return filteredMatches.slice(0, 8);
                    } catch (error) {
                        console.error(`Error fetching matches for league ${leagueId}:`, error);
                        return [];
                    }
                })
            );

            matches = leagueMatches.flat();
        } else if (date && league) {
            // Obtener un rango de fechas para incluir partidos cercanos
            const targetDate = parseISO(date);
            const fromDate = subDays(targetDate, 1);
            const toDate = addDays(targetDate, 1);

            const fromDateStr = format(fromDate, 'yyyy-MM-dd');
            const toDateStr = format(toDate, 'yyyy-MM-dd');

            matches = await api.getFixturesByDateRangeAndLeague(fromDateStr, toDateStr, parseInt(league));

            // Filtrar para mostrar solo los partidos que corresponden al día seleccionado
            const selectedDateStr = getDateString(date);
            matches = matches.filter(match => {
                const matchDateStr = getDateString(match.fixture.date);
                return matchDateStr === selectedDateStr;
            });
        } else if (league) {
            // Obtener partidos recientes (últimos 14 días) para la liga
            const today = new Date();
            const weekAgo = subDays(today, 14); // Increased to get more finished matches

            const fromDateStr = format(weekAgo, 'yyyy-MM-dd');
            const toDateStr = format(today, 'yyyy-MM-dd');

            matches = await api.getFixturesByDateRangeAndLeague(fromDateStr, toDateStr, parseInt(league));
        } else {
            // Default: obtener partidos recientes de TODAS las ligas disponibles
            const defaultLeagues = [128, 129, 130, 2, 3, 848, 15]; // Todas las ligas disponibles
            const today = new Date();
            const weekAgo = subDays(today, 14); // Increased to 14 days to get more finished matches

            const fromDateStr = format(weekAgo, 'yyyy-MM-dd');
            const toDateStr = format(today, 'yyyy-MM-dd');

            const leagueMatches = await Promise.all(
                defaultLeagues.map(async (leagueId) => {
                    try {
                        const leagueMatches = await api.getFixturesByDateRangeAndLeague(fromDateStr, toDateStr, leagueId);

                        // Sort to prioritize finished matches (they have stats)
                        leagueMatches.sort((a, b) => {
                            const aFinished = a.fixture.status.short === "FT" || a.fixture.status.short === "AET" || a.fixture.status.short === "PEN" || a.fixture.status.short === "AWD" || a.fixture.status.short === "WO";
                            const bFinished = b.fixture.status.short === "FT" || b.fixture.status.short === "AET" || b.fixture.status.short === "PEN" || b.fixture.status.short === "AWD" || b.fixture.status.short === "WO";

                            if (aFinished && !bFinished) return -1;
                            if (!aFinished && bFinished) return 1;
                            return new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime();
                        });

                        return leagueMatches.slice(0, 8); // Increased to 8 matches per league to get more finished matches
                    } catch (error) {
                        console.error(`Error fetching matches for league ${leagueId}:`, error);
                        return [];
                    }
                })
            );

            matches = leagueMatches.flat();
        }

        // Add statistics for each match (only for finished matches)
        const matchesWithStats: Match[] = await Promise.all(
            matches.map(async (match) => {
                // Solo obtener estadísticas para partidos finalizados
                const isFinished = match.fixture.status.short === "FT" ||
                    match.fixture.status.short === "AET" ||
                    match.fixture.status.short === "PEN" ||
                    match.fixture.status.short === "AWD" || // Awarded (walkover)
                    match.fixture.status.short === "WO" ||  // Walkover
                    match.fixture.status.long === "Match Finished" ||
                    match.fixture.status.long === "Match Finished After Extra Time" ||
                    match.fixture.status.long === "Match Finished After Penalty" ||
                    match.fixture.status.long === "Match Awarded";


                if (isFinished) {
                    try {
                        // Fetch stats with timeout
                        const { home, away } = await api.getMatchStats(match)

                        return {
                            ...match,
                            statistics: {
                                home,
                                away
                            }
                        };
                    } catch (error) {
                        console.error(`❌ Error fetching stats for match ${match.fixture.id} (League ${match.league.id}):`, error);
                        return match;
                    }
                } else {
                    return match;
                }
            })
        );

        return NextResponse.json({ matches: matchesWithStats });
    } catch (error) {
        console.error("Error fetching fixtures:", error);
        return NextResponse.json({ error: "Error al obtener los partidos" }, { status: 500 });
    }
}