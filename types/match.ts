export interface Team {
    name: string;
    logo: string;
    id: number;
}

export interface League {
    id: number;
    name: string;
    logo: string;
    country: string;
    season?: number;
}

export interface Fixture {
    id: number;
    date: string;
    status: {
        long: string;
        short: string;
        elapsed?: number | null;
    };
}

export interface Goals {
    home: number;
    away: number;
}

export enum StatisticsKeys {
    SHOTS_ON_GOAL = 'Shots on Goal',
    SHOTS_OFF_GOAL = 'Shots off Goal',
    TOTAL_SHOTS = 'Total Shots',
    BLOCKED_SHOTS = 'Blocked Shots',
    SHOTS_INSIDE_BOX = 'Shots insidebox',
    SHOTS_OUTSIDE_BOX = 'Shots outsidebox',
    FOULS = 'Fouls',
    CORNER_KICKS = 'Corner Kicks',
    OFFSIDES = 'Offsides',
    BALL_POSSESSION = 'Ball Possession',
    YELLOW_CARDS = 'Yellow Cards',
    RED_CARDS = 'Red Cards',
    GOALKEEPER_SAVES = 'Goalkeeper Saves',
    TOTAL_PASSES = 'Total passes',
    PASSES_ACCURATE = 'Passes accurate',
    PASSES_PERCENTAGE = 'Passes %',
    EXPECTED_GOALS = 'expected_goals',
    GOALS_PREVENTED = 'goals_prevented'
}

export const STATISTICS_LABELS = Object.freeze({
    [StatisticsKeys.SHOTS_ON_GOAL]: 'Tiros a puerta',
    [StatisticsKeys.SHOTS_OFF_GOAL]: 'Tiros fuera',
    [StatisticsKeys.TOTAL_SHOTS]: 'Tiros totales',
    [StatisticsKeys.BLOCKED_SHOTS]: 'Tiros bloqueados',
    [StatisticsKeys.SHOTS_INSIDE_BOX]: 'Tiros dentro del área',
    [StatisticsKeys.SHOTS_OUTSIDE_BOX]: 'Tiros fuera del área',
    [StatisticsKeys.FOULS]: 'Faltas',
    [StatisticsKeys.CORNER_KICKS]: 'Tiros de esquina',
    [StatisticsKeys.OFFSIDES]: 'Fuera de juego',
    [StatisticsKeys.BALL_POSSESSION]: 'Posesión de balón',
    [StatisticsKeys.YELLOW_CARDS]: 'Tarjetas amarillas',
    [StatisticsKeys.RED_CARDS]: 'Tarjetas rojas',
    [StatisticsKeys.GOALKEEPER_SAVES]: 'Atajadas del portero',
    [StatisticsKeys.TOTAL_PASSES]: 'Pases totales',
    [StatisticsKeys.PASSES_ACCURATE]: 'Pases precisos',
    [StatisticsKeys.PASSES_PERCENTAGE]: 'Porcentaje de pases',
    [StatisticsKeys.EXPECTED_GOALS]: 'Goles esperados',
    [StatisticsKeys.GOALS_PREVENTED]: 'Goles evitados'
})

export type TeamMatchStats = { type: StatisticsKeys, value: number | string | null }[];
export enum EventsKeys {
    CARD = 'Card',
    GOAL = 'Goal',
    SUBSTITUTION = 'subst',
}
export const EVENTS_LABELS = Object.freeze({
    [EventsKeys.CARD]: 'Tarjeta',
    [EventsKeys.GOAL]: 'Gol',
    [EventsKeys.SUBSTITUTION]: 'Sustitución'
})
export type TeamMatchEvents = {
    type: EventsKeys,
    time: {
        elapsed: number;
        extra: number | null;
    },
    team:{
        id: number,
        name: string,
        logo: string
    },
    player: {
        id: number,
        name: string
    },
    assist: {
        id: number | null,
        name: string | null
    },
    detail: string,
    comments: string | null
}[];


export interface Match {
    league: League;
    fixture: Fixture;
    teams: { home: Team; away: Team };
    goals: Goals;
    statistics?: {
        home: TeamMatchStats;
        away: TeamMatchStats;
    };
    events?: {
        home: TeamMatchEvents;
        away: TeamMatchEvents;
    };
}

export interface LineupTeam {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string };
  formation: string;
  startXI: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid?: string;
    };
  }[];
  substitutes: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid?: string;
    };
  }[];
}
