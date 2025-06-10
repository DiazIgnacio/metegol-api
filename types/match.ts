export interface Team {
    name: string;
    logo: string;
    id: number;
}

export interface Fixture {
    id: number;
    date: string;
    status: {
        long: string;
        short: string;
    };
}

export interface Goals {
    home: number;
    away: number;
}

export interface Match {
    fixture: Fixture;
    teams: { home: Team; away: Team };
    goals: Goals;
}
