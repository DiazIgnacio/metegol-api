// Centralized league IDs configuration - ORDERED BY POPULARITY (most known first)
// This ensures all systems use the same league list with consistent priority order

export const ALL_NAVBAR_LEAGUES = [
  // 🇦🇷 TOP ARGENTINA (most popular first)
  128, // Liga Profesional Argentina (most popular)
  129, // Primera Nacional
  130, // Copa Argentina
  131, // Copa de la Liga

  // 🏆 CONMEBOL - Most prestigious South American competitions
  13, // Copa Libertadores (very popular internationally)
  11, // Copa Sudamericana

  // 🇪🇺 UEFA - Most prestigious European competitions
  2, // Champions League (globally most popular)
  3, // Europa League
  848, // Conference League

  // ⭐ TOP 5 EUROPEAN LEAGUES (Big 5)
  39, // Premier League (globally very popular)
  140, // La Liga (globally very popular)
  135, // Serie A (globally popular)
  78, // Bundesliga (globally popular)
  61, // Ligue 1 (globally popular)

  // 🇧🇷 BRAZIL (popular in South America)
  71, // Brasileirão Série A
  73, // Copa do Brasil

  // 🌎 WORLD COMPETITIONS (prestigious but less frequent)
  15, // Mundial de Clubes
  1, // Copa del Mundo
  4, // Eurocopa
  9, // Copa América

  // 🇺🇸🇲🇽 NORTH AMERICA (growing popularity)
  253, // MLS (USA)
  262, // Liga MX (Mexico)

  // 🇪🇺 OTHER EUROPEAN CUPS & LEAGUES
  143, // Copa del Rey (Spain)
  45, // FA Cup (England)
  137, // Coppa Italia (Italy)
  66, // Coupe de France (France)
  556, // Supercopa España
  48, // Community Shield (England)
  139, // Supercoppa Italiana
  5, // UEFA Nations League
  94, // Primeira Liga (Portugal)
  88, // Eredivisie (Netherlands)
  203, // Süper Lig (Turkey)

  // 🇦🇷 OTHER ARGENTINA (less popular)
  132, // Supercopa Argentina
  133, // Primera B
  134, // Primera C
  484, // Torneo Federal A
  485, // Primera D

  // 🇧🇷 OTHER BRAZIL
  72, // Brasileirão Série B
  76, // Paulista A1
  77, // Carioca

  // 🌎 OTHER SOUTH AMERICA
  265, // Primera División (Chile)
  239, // Liga BetPlay (Colombia)
  318, // Primera División (Uruguay)
  12, // Recopa Sudamericana
  250, // División Profesional (Paraguay)
  281, // Liga 1 (Peru)
  242, // Serie A (Ecuador)
  270, // División Profesional (Bolivia)

  // 🇺🇸🇲🇽 OTHER NORTH AMERICA
  263, // Liga de Expansión MX
  264, // Copa MX
  254, // USL Championship
  255, // US Open Cup
] as const;

// Priority leagues for high-frequency sync (TOP 20 most popular) - ORDERED BY POPULARITY
export const PRIORITY_LEAGUES = [
  // 🇦🇷 TOP ARGENTINA (4)
  128, // Liga Profesional Argentina (most important)
  129, // Primera Nacional
  130, // Copa Argentina
  131, // Copa de la Liga

  // 🏆 CONMEBOL (2) - Most prestigious
  13, // Copa Libertadores
  11, // Copa Sudamericana

  // 🇪🇺 UEFA (3) - Most prestigious
  2, // Champions League
  3, // Europa League
  848, // Conference League

  // ⭐ TOP 5 EUROPEAN LEAGUES (5)
  39, // Premier League
  140, // La Liga
  135, // Serie A
  78, // Bundesliga
  61, // Ligue 1

  // 🇧🇷 BRAZIL (2)
  71, // Brasileirão Série A
  73, // Copa do Brasil

  // 🌎 WORLD (2) - Most important international competitions
  15, // Mundial de Clubes
  1, // Copa del Mundo

  // 🇺🇸🇲🇽 NORTH AMERICA (2) - Growing popularity
  253, // MLS
  262, // Liga MX
] as const;

// League categories for different sync strategies
export const LEAGUE_CATEGORIES = {
  ARGENTINA: [128, 129, 130, 131, 132, 133, 134, 484, 485],
  UEFA: [2, 3, 848, 5],
  TOP_EUROPEAN: [140, 39, 135, 78, 61],
  SOUTH_AMERICA: [13, 11, 12],
  BRAZIL: [71, 72, 73, 76, 77],
  MEXICO_USA: [262, 263, 264, 253, 254, 255],
  OTHER_SOUTH_AMERICA: [265, 239, 318, 250, 281, 242, 270],
  WORLD: [1, 15, 4, 9],
} as const;

// Type for league IDs
export type LeagueId = (typeof ALL_NAVBAR_LEAGUES)[number];
export type PriorityLeagueId = (typeof PRIORITY_LEAGUES)[number];
