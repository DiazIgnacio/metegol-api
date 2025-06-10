import { NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

const API_LIMIT = 1; // Limitar a 8 equipos
const SEASON = 2025; //new Date().getFullYear();

export async function GET() {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "No se encontró la clave de API" }, { status: 500 });
    }
    const api = new FootballApiServer(apiKey);
    try {
        const teamsData = await api.getArgentinianTeams(SEASON);
        const teams = teamsData.response || [];
        const limitedTeams = teams.slice(0, API_LIMIT);
        const matchesPromises = limitedTeams.map((team: { team: { id: number } }) =>
            api.getArgentinianTeamMatches(team.team.id, SEASON)
        );
        const matchesResults = await Promise.all(matchesPromises);
        console.log("Matches results:", matchesResults);
        const allMatches = matchesResults.flatMap((result: { response?: unknown[] }) => result.response || []);
        return NextResponse.json({ matches: allMatches });
    } catch {
        return NextResponse.json({ error: "Error al obtener los partidos" }, { status: 500 });
    }
}
