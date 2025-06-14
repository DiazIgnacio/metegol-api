import { NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";
import { Match } from "@/types/match";

const API_LIMIT = 1;
const SEASON = 2025;

export async function GET() {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "No se encontró la clave de API" }, { status: 500 });
    }
    const api = new FootballApiServer(apiKey);
    try {
        const teams = await api.getTeams(SEASON);
        const limitedTeams = teams.slice(0, API_LIMIT);
        const matchesResults = await Promise.all(limitedTeams.map(team => api.getTeamMatches(team.id, SEASON)));
        const matchesWithoutStats = matchesResults.filter(x => x !== null).flat();
        const matches: Match[] = await Promise.all(matchesWithoutStats.map(async (match) => {
            const home = await api.getMatchTeamStats(match.fixture.id, match.teams.home.id);
            const away = await api.getMatchTeamStats(match.fixture.id, match.teams.away.id);
            return {
                ...match,
                statistics: {
                    home,
                    away
                }
            }
        }))

        return NextResponse.json({ matches });
    } catch {
        return NextResponse.json({ error: "Error al obtener los partidos" }, { status: 500 });
    }
}
