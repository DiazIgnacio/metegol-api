import { apiCall } from "@/lib/utils";
import type { Match, Team, TeamMatchStats } from "@/types/match";

export class FootballApi {
    private static baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    static async getMatches(): Promise<Match[]> {
        const url = this.baseUrl + "/api/team-matches";
        const data = await apiCall<{ matches: Match[] }>(url, { cache: "no-store" });
        return data.matches || [];
    }
}

export class FootballApiServer {
    private apiKey: string;
    private baseUrl: string = "https://v3.football.api-sports.io";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request<T>(endpoint: string, params: Record<string, string | number> = {}) {
        const url = new URL(this.baseUrl + endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
        const res = await fetch(url.toString(), {
            headers: {
                "x-apisports-key": this.apiKey,
                "Accept": "application/json",
            },
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return (await res.json()).response as T;
    }

    async getMatchTeamStats(matchId: number, teamId: number): Promise<TeamMatchStats> {
        const obj = await this.request<{ team: Team, statistics: TeamMatchStats }[]>("/fixtures/statistics", { team: teamId, fixture: matchId });
        return obj.at(0)?.statistics ?? [];
    }

    async getTeamMatches(teamId: number, season: number): Promise<Match[]> {
        const match = await this.request<Match[]>("/fixtures", { team: teamId, season, league: 128 });
        return match ?? [];
    }

    async getTeams(season: number): Promise<Team[]> {
        const teamData = await this.request<{ team: Team }[]>("/teams", { league: 128, season }) ?? [];
        return teamData.map(({ team }) => team);
    }
}
