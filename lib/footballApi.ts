import { apiCall } from "@/lib/utils";
import type { Match, Team, TeamMatchStats, League, TeamMatchEvents } from "@/types/match";

export class FootballApi {
    private static baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    static async getMatches(date?: string, league?: number): Promise<Match[]> {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (league) params.append('league', league.toString());

        const url = this.baseUrl + "/api/fixtures" + (params.toString() ? `?${params.toString()}` : "");
        const data = await apiCall<{ matches: Match[] }>(url, { cache: "no-store" });
        return data.matches || [];
    }

    static async getMultipleLeaguesMatches(date?: string, leagues?: number[]): Promise<Match[]> {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (leagues && leagues.length > 0) {
            params.append('leagues', leagues.join(','));
        }

        const url = this.baseUrl + "/api/fixtures" + (params.toString() ? `?${params.toString()}` : "");
        const data = await apiCall<{ matches: Match[] }>(url, { cache: "no-store" });
        return data.matches || [];
    }

    static async getLeagues(): Promise<League[]> {
        const url = this.baseUrl + "/api/leagues";
        const data = await apiCall<{ leagues: League[] }>(url, { cache: "no-store" });
        return data.leagues || [];
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
        const json = await res.json();
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return (json).response as T;
    }

    async getMatchStats(match: Match): Promise<{ home: TeamMatchStats, away: TeamMatchStats }> {
        try {
            const obj = await this.request<{ team: { id: number, name: string, logo: string }, statistics: TeamMatchStats }[]>("/fixtures/statistics", { fixture: match.fixture.id });
            const home = obj.find(x => x.team.id === match.teams.home.id)?.statistics ?? [] as TeamMatchStats;
            const away = obj.find(x => x.team.id === match.teams.away.id)?.statistics ?? [] as TeamMatchStats;

            return { home, away }
        } catch (error) {
            console.error(`Error fetching team stats for match ${match.fixture.id}:`, error);
            return { home: [], away: [] };
        }
    }

    async getMatchEvents(match: Match): Promise<{ home: TeamMatchEvents, away: TeamMatchEvents }> {
        try {
            const obj = await this.request<TeamMatchEvents>("/fixtures/events", { fixture: match.fixture.id });
            const home = obj.filter(x => x.team.id === match.teams.home.id) ?? [] as TeamMatchEvents;
            const away = obj.filter(x => x.team.id === match.teams.away.id) ?? [] as TeamMatchEvents;

            return { home, away }
        } catch (error) {
            console.error(`Error fetching team stats for match ${match.fixture.id}:`, error);
            return { home: [], away: [] };
        }
    }

    async getTeamMatches(teamId: number, season: number): Promise<Match[]> {
        const match = await this.request<Match[]>("/fixtures", { team: teamId, season, league: 128 });
        return match ?? [];
    }

    async getFixturesByDateAndLeague(date: string, league: number): Promise<Match[]> {
        const season = new Date(date).getFullYear();
        const fixtures = await this.request<Match[]>("/fixtures", { date, league, season });
        return (fixtures ?? [])
            .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
            .slice(0, 20);
    }

    async getFixturesByDateRangeAndLeague(fromDate: string, toDate: string, league: number): Promise<Match[]> {
        const season = new Date(fromDate).getFullYear();
        const fixtures = await this.request<Match[]>("/fixtures", {
            from: fromDate,
            to: toDate,
            league,
            season
        });
        return (fixtures ?? [])
            .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
            .slice(0, 20);
    }

    async getTeams(season: number): Promise<Team[]> {
        const teamData = await this.request<{ team: Team }[]>("/teams", { league: 128, season }) ?? [];
        return teamData.map(({ team }) => team);
    }

    async getLeaguesByCountry(country: string): Promise<League[]> {
        const leagueData = await this.request<{ league: League }[]>("/leagues", { country }) ?? [];
        return leagueData.map(({ league }) => league);
    }
}
