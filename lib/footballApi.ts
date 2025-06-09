// src/lib/footballApi.ts
import { apiCall } from "@/lib/utils";
import type { Match } from "@/types/match";

// Clase para llamadas a la API interna (Next.js route) - puede usarse en server y client
export class FootballApi {
    static async getMatches(): Promise<Match[]> {
        const isServer = typeof window === "undefined";
        // Cambia la ruta para obtener partidos de equipos argentinos
        const url = isServer
            ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/team-matches`
            : "/api/team-matches";
        const data = await apiCall<{ matches: Match[] }>(url, { cache: "no-store" });
        return data.matches || [];
    }
}

// Clase para llamadas directas a la API de api-football.com (solo server)
export class FootballApiServer {
    private apiKey: string;
    private baseUrl: string = "https://v3.football.api-sports.io";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request(endpoint: string, params: Record<string, string | number> = {}) {
        const url = new URL(this.baseUrl + endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
        const res = await fetch(url.toString(), {
            headers: {
                "x-apisports-key": this.apiKey,
                "Accept": "application/json",
            },
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    }

    // Obtener partidos de equipos argentinos por temporada
    async getArgentinianTeamMatches(teamId: number, season: number) {
        // Liga Profesional Argentina ID: 128 (según API-Football docs)
        return this.request("/fixtures", { team: teamId, season, league: 128 });
    }

    // Obtener información de equipos argentinos
    async getArgentinianTeams(season: number) {
        // Liga Profesional Argentina ID: 128
        return this.request("/teams", { league: 128, season });
    }

    // Obtener información de un equipo argentino
    async getArgentinianTeamInfo(teamId: number) {
        return this.request("/teams", { id: teamId });
    }

    // Obtener estadísticas de la liga argentina
    async getArgentinianLeagueStats(season: number) {
        // Liga Profesional Argentina ID: 128
        return this.request("/standings", { league: 128, season });
    }

    // Obtener todas las ligas de fútbol de Argentina
    async getArgentinianLeagues() {
        return this.request("/leagues", { country: "Argentina" });
    }
}
