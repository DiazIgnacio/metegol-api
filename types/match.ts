export interface Team {
    name: string;
}

export interface Fixture {
    id: number;
    date: string;
}

export interface Goals {
    home: number;
    away: number;
}

export interface Match {
    fixture: Fixture;
    teams: { home: Team; away: Team };
    goals: Goals;
    statistics?: Array<{
        team: Team;
        statistics: Array<{ type: string; value: string | number | null }>;
    }>;
}
