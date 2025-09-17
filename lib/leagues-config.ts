// Central configuration for all leagues used in the application

export const ALL_LEAGUE_IDS = [
  // Argentina
  128, // Liga Profesional
  129, // Primera Nacional
  130, // Copa Argentina
  131, // Copa de la Liga
  132, // Supercopa Argentina
  133, // Primera B
  134, // Primera C
  484, // Torneo Federal A
  485, // Primera D

  // UEFA - Europe
  2, // Champions League
  3, // Europa League
  848, // Conference League
  5, // UEFA Nations League

  // Spain
  140, // La Liga
  143, // Copa del Rey
  556, // Supercopa España

  // England
  39, // Premier League
  45, // FA Cup
  48, // Community Shield

  // Italy
  135, // Serie A
  137, // Coppa Italia
  139, // Supercoppa Italiana

  // Germany
  78, // Bundesliga

  // France
  61, // Ligue 1
  66, // Coupe de France

  // Brazil
  71, // Brasileirão Série A
  72, // Brasileirão Série B
  73, // Copa do Brasil
  76, // Paulista A1
  77, // Carioca

  // Portugal
  94, // Primeira Liga

  // Netherlands
  88, // Eredivisie

  // Mexico
  262, // Liga MX
  263, // Liga de Expansión MX
  264, // Copa MX

  // USA
  253, // Major League Soccer
  254, // USL Championship
  255, // US Open Cup

  // Chile
  265, // Primera División

  // Colombia
  239, // Liga BetPlay

  // Uruguay
  318, // Primera División

  // Paraguay
  250, // División Profesional

  // Peru
  281, // Liga 1

  // Ecuador
  242, // Serie A

  // Bolivia
  270, // División Profesional

  // CONMEBOL - South America
  13, // Copa Libertadores
  11, // Copa Sudamericana
  12, // Recopa Sudamericana

  // Turkey
  203, // Süper Lig

  // World Competitions
  1, // Copa del Mundo
  15, // Mundial de Clubes
  4, // Eurocopa
  9, // Copa América
];

// Priority leagues (most active/popular) - used for default sync
export const PRIORITY_LEAGUE_IDS = [
  128,
  129,
  130, // Argentina (Liga Profesional, Primera Nacional, Copa Argentina)
  2,
  3,
  848, // UEFA (Champions, Europa, Conference)
  140,
  39,
  135,
  78,
  61, // Top 5 European leagues
  13,
  11, // CONMEBOL (Libertadores, Sudamericana)
  71,
  73, // Brazil (Brasileirão A, Copa do Brasil)
  15, // Mundial de Clubes
];

// Legacy support - keep the original default leagues for backwards compatibility
export const LEGACY_DEFAULT_LEAGUES = [128, 129, 130, 2, 3, 848, 15];
