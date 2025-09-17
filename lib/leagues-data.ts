// Static leagues data - separated from React components for server-side usage

export interface League {
  id: number;
  name: string;
  logo: string;
  country: string;
}

export const STATIC_LEAGUES: League[] = [
  // Argentina
  {
    id: 128,
    name: "Liga Profesional",
    logo: "https://media.api-sports.io/football/leagues/128.png",
    country: "Argentina",
  },
  {
    id: 129,
    name: "Primera Nacional",
    logo: "https://media.api-sports.io/football/leagues/129.png",
    country: "Argentina",
  },
  {
    id: 130,
    name: "Copa Argentina",
    logo: "https://media.api-sports.io/football/leagues/130.png",
    country: "Argentina",
  },
  {
    id: 131,
    name: "Copa de la Liga",
    logo: "https://media.api-sports.io/football/leagues/131.png",
    country: "Argentina",
  },
  {
    id: 132,
    name: "Supercopa Argentina",
    logo: "https://media.api-sports.io/football/leagues/132.png",
    country: "Argentina",
  },
  {
    id: 133,
    name: "Primera B",
    logo: "https://media.api-sports.io/football/leagues/133.png",
    country: "Argentina",
  },
  {
    id: 134,
    name: "Primera C",
    logo: "https://media.api-sports.io/football/leagues/134.png",
    country: "Argentina",
  },
  {
    id: 484,
    name: "Torneo Federal A",
    logo: "https://media.api-sports.io/football/leagues/484.png",
    country: "Argentina",
  },
  {
    id: 485,
    name: "Primera D",
    logo: "https://media.api-sports.io/football/leagues/485.png",
    country: "Argentina",
  },

  // UEFA - Europe
  {
    id: 2,
    name: "Champions League",
    logo: "https://media.api-sports.io/football/leagues/2.png",
    country: "Europe",
  },
  {
    id: 3,
    name: "Europa League",
    logo: "https://media.api-sports.io/football/leagues/3.png",
    country: "Europe",
  },
  {
    id: 848,
    name: "Conference League",
    logo: "https://media.api-sports.io/football/leagues/848.png",
    country: "Europe",
  },
  {
    id: 5,
    name: "UEFA Nations League",
    logo: "https://media.api-sports.io/football/leagues/5.png",
    country: "Europe",
  },

  // Spain
  {
    id: 140,
    name: "La Liga",
    logo: "https://media.api-sports.io/football/leagues/140.png",
    country: "Spain",
  },
  {
    id: 143,
    name: "Copa del Rey",
    logo: "https://media.api-sports.io/football/leagues/143.png",
    country: "Spain",
  },
  {
    id: 556,
    name: "Supercopa España",
    logo: "https://media.api-sports.io/football/leagues/556.png",
    country: "Spain",
  },

  // England
  {
    id: 39,
    name: "Premier League",
    logo: "https://media.api-sports.io/football/leagues/39.png",
    country: "England",
  },
  {
    id: 45,
    name: "FA Cup",
    logo: "https://media.api-sports.io/football/leagues/45.png",
    country: "England",
  },
  {
    id: 48,
    name: "Community Shield",
    logo: "https://media.api-sports.io/football/leagues/48.png",
    country: "England",
  },

  // Italy
  {
    id: 135,
    name: "Serie A",
    logo: "https://media.api-sports.io/football/leagues/135.png",
    country: "Italy",
  },
  {
    id: 137,
    name: "Coppa Italia",
    logo: "https://media.api-sports.io/football/leagues/137.png",
    country: "Italy",
  },
  {
    id: 139,
    name: "Supercoppa Italiana",
    logo: "https://media.api-sports.io/football/leagues/139.png",
    country: "Italy",
  },

  // Germany
  {
    id: 78,
    name: "Bundesliga",
    logo: "https://media.api-sports.io/football/leagues/78.png",
    country: "Germany",
  },

  // France
  {
    id: 61,
    name: "Ligue 1",
    logo: "https://media.api-sports.io/football/leagues/61.png",
    country: "France",
  },
  {
    id: 66,
    name: "Coupe de France",
    logo: "https://media.api-sports.io/football/leagues/66.png",
    country: "France",
  },

  // Brazil
  {
    id: 71,
    name: "Brasileirão Série A",
    logo: "https://media.api-sports.io/football/leagues/71.png",
    country: "Brazil",
  },
  {
    id: 72,
    name: "Brasileirão Série B",
    logo: "https://media.api-sports.io/football/leagues/72.png",
    country: "Brazil",
  },
  {
    id: 73,
    name: "Copa do Brasil",
    logo: "https://media.api-sports.io/football/leagues/73.png",
    country: "Brazil",
  },
  {
    id: 76,
    name: "Paulista A1",
    logo: "https://media.api-sports.io/football/leagues/76.png",
    country: "Brazil",
  },
  {
    id: 77,
    name: "Carioca",
    logo: "https://media.api-sports.io/football/leagues/77.png",
    country: "Brazil",
  },

  // Portugal
  {
    id: 94,
    name: "Primeira Liga",
    logo: "https://media.api-sports.io/football/leagues/94.png",
    country: "Portugal",
  },

  // Netherlands
  {
    id: 88,
    name: "Eredivisie",
    logo: "https://media.api-sports.io/football/leagues/88.png",
    country: "Netherlands",
  },

  // Mexico
  {
    id: 262,
    name: "Liga MX",
    logo: "https://media.api-sports.io/football/leagues/262.png",
    country: "Mexico",
  },
  {
    id: 263,
    name: "Liga de Expansión MX",
    logo: "https://media.api-sports.io/football/leagues/263.png",
    country: "Mexico",
  },
  {
    id: 264,
    name: "Copa MX",
    logo: "https://media.api-sports.io/football/leagues/264.png",
    country: "Mexico",
  },

  // USA
  {
    id: 253,
    name: "Major League Soccer",
    logo: "https://media.api-sports.io/football/leagues/253.png",
    country: "USA",
  },
  {
    id: 254,
    name: "USL Championship",
    logo: "https://media.api-sports.io/football/leagues/254.png",
    country: "USA",
  },
  {
    id: 255,
    name: "US Open Cup",
    logo: "https://media.api-sports.io/football/leagues/255.png",
    country: "USA",
  },

  // Chile
  {
    id: 265,
    name: "Primera División",
    logo: "https://media.api-sports.io/football/leagues/265.png",
    country: "Chile",
  },

  // Colombia
  {
    id: 239,
    name: "Liga BetPlay",
    logo: "https://media.api-sports.io/football/leagues/239.png",
    country: "Colombia",
  },

  // Uruguay
  {
    id: 318,
    name: "Primera División",
    logo: "https://media.api-sports.io/football/leagues/318.png",
    country: "Uruguay",
  },

  // Paraguay
  {
    id: 250,
    name: "División Profesional",
    logo: "https://media.api-sports.io/football/leagues/250.png",
    country: "Paraguay",
  },

  // Peru
  {
    id: 281,
    name: "Liga 1",
    logo: "https://media.api-sports.io/football/leagues/281.png",
    country: "Peru",
  },

  // Ecuador
  {
    id: 242,
    name: "Serie A",
    logo: "https://media.api-sports.io/football/leagues/242.png",
    country: "Ecuador",
  },

  // Bolivia
  {
    id: 270,
    name: "División Profesional",
    logo: "https://media.api-sports.io/football/leagues/270.png",
    country: "Bolivia",
  },

  // CONMEBOL - South America
  {
    id: 13,
    name: "Copa Libertadores",
    logo: "https://media.api-sports.io/football/leagues/13.png",
    country: "South America",
  },
  {
    id: 11,
    name: "Copa Sudamericana",
    logo: "https://media.api-sports.io/football/leagues/11.png",
    country: "South America",
  },
  {
    id: 12,
    name: "Recopa Sudamericana",
    logo: "https://media.api-sports.io/football/leagues/12.png",
    country: "South America",
  },

  // Turkey
  {
    id: 203,
    name: "Süper Lig",
    logo: "https://media.api-sports.io/football/leagues/203.png",
    country: "Turkey",
  },

  // World Competitions
  {
    id: 1,
    name: "Copa del Mundo",
    logo: "https://media.api-sports.io/football/leagues/1.png",
    country: "World",
  },
  {
    id: 15,
    name: "Mundial de Clubes",
    logo: "https://media.api-sports.io/football/leagues/15.png",
    country: "World",
  },
  {
    id: 4,
    name: "Eurocopa",
    logo: "https://media.api-sports.io/football/leagues/4.png",
    country: "World",
  },
  {
    id: 9,
    name: "Copa América",
    logo: "https://media.api-sports.io/football/leagues/9.png",
    country: "World",
  },
];
