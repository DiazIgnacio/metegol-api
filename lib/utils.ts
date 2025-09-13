import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Error al llamar a la API: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Función para abreviar nombres de equipos con ciudades
export function abbreviateTeamName(teamName: string): string {
  if (!teamName) return teamName;

  // Diccionario de abreviaciones específicas para equipos conocidos
  const teamAbbreviations: Record<string, string> = {
    // Argentina - Equipos con ciudades largas
    "Central Cordoba de Santiago del Estero": "Central Córdoba SdE",
    "Central Córdoba de Santiago del Estero": "Central Córdoba SdE",
    "Central Cordoba Santiago del Estero": "Central Córdoba SdE",
    "Atletico Tucuman": "Atlético Tucumán",
    "Club Atletico Tucuman": "Atlético Tucumán",
    "Defensa y Justicia": "Defensa y Justicia",
    "Club Atletico Independiente": "Independiente",
    "Club Atletico River Plate": "River Plate",
    "Club Atletico Boca Juniors": "Boca Juniors",
    "Club Atletico San Lorenzo": "San Lorenzo",
    "Club Atletico Racing Club": "Racing Club",
    "Club Estudiantes de La Plata": "Estudiantes LP",
    "Estudiantes de La Plata": "Estudiantes LP",
    "Gimnasia y Esgrima La Plata": "Gimnasia LP",
    "Club de Gimnasia y Esgrima La Plata": "Gimnasia LP",
    "Rosario Central": "Rosario Central",
    "Club Atletico Rosario Central": "Rosario Central",
    "Club Atletico Newell's Old Boys": "Newell's",
    "Newell's Old Boys": "Newell's",
    "Arsenal de Sarandi": "Arsenal",
    "Club Atletico Banfield": "Banfield",
    "Club Atletico Lanus": "Lanús",
    "Club Atletico Tigre": "Tigre",
    "Club Atletico Huracan": "Huracán",
    "Velez Sarsfield": "Vélez",
    "Club Atletico Velez Sarsfield": "Vélez",
    "Club Atletico Colon": "Colón",
    "Colon de Santa Fe": "Colón",
    "Union de Santa Fe": "Unión SF",
    "Club Atletico Union": "Unión SF",
    "Godoy Cruz Antonio Tomba": "Godoy Cruz",
    "Club Deportivo Godoy Cruz": "Godoy Cruz",
    "Instituto Atletico Central Cordoba": "Instituto",
    "Club Atletico Talleres": "Talleres",
    "Talleres de Cordoba": "Talleres",
    "Club Atletico Belgrano": "Belgrano",
    "Belgrano de Cordoba": "Belgrano",
    "Deportivo Riestra": "Riestra",
    "Club Atletico Platense": "Platense",
    "Club Atletico Sarmiento": "Sarmiento",
    "Sarmiento de Junin": "Sarmiento",
    "Club Atletico Barracas Central": "Barracas Central",

    // Brasil - Equipos con nombres largos
    "Clube de Regatas do Flamengo": "Flamengo",
    "Sport Club Corinthians Paulista": "Corinthians",
    "Sociedade Esportiva Palmeiras": "Palmeiras",
    "Sao Paulo Futebol Clube": "São Paulo",
    "Santos Futebol Clube": "Santos",
    "Clube Atletico Mineiro": "Atlético-MG",
    "Cruzeiro Esporte Clube": "Cruzeiro",
    "Gremio Football Porto Alegrense": "Grêmio",
    "Sport Club Internacional": "Internacional",
    "Clube de Regatas Vasco da Gama": "Vasco",
    "Botafogo de Futebol e Regatas": "Botafogo",
    "Fluminense Football Club": "Fluminense",

    // España - Equipos con nombres largos
    "Real Club Deportivo Espanyol": "Espanyol",
    "Real Club Deportivo de La Coruña": "Deportivo",
    "Club Atletico de Madrid": "Atlético Madrid",
    "Real Club Celta de Vigo": "Celta",
    "Real Sociedad de Futbol": "Real Sociedad",
    "Athletic Club Bilbao": "Athletic",
    "Club Atletico Osasuna": "Osasuna",
    "Real Valladolid Club de Futbol": "Valladolid",

    // Inglaterra - Equipos con nombres largos
    "Manchester United Football Club": "Man United",
    "Manchester City Football Club": "Man City",
    "Liverpool Football Club": "Liverpool",
    "Arsenal Football Club": "Arsenal",
    "Chelsea Football Club": "Chelsea",
    "Tottenham Hotspur Football Club": "Tottenham",
    "Newcastle United Football Club": "Newcastle",
    "West Ham United Football Club": "West Ham",
    "Brighton & Hove Albion": "Brighton",
    "Crystal Palace Football Club": "Crystal Palace",

    // Otros equipos internacionales comunes
    "Football Club Barcelona": "Barcelona",
    "Real Madrid Club de Futbol": "Real Madrid",
    "Juventus Football Club": "Juventus",
    "Associazione Calcio Milan": "AC Milan",
    "Football Club Internazionale Milano": "Inter Milan",
    "Bayern Munich": "Bayern",
    "Borussia Dortmund": "Dortmund",
    "Paris Saint-Germain Football Club": "PSG",
  };

  // Primero buscar coincidencia exacta en el diccionario
  if (teamAbbreviations[teamName]) {
    return teamAbbreviations[teamName];
  }

  // Buscar coincidencia parcial (sin distinción de mayúsculas/minúsculas)
  const normalizedName = teamName.toLowerCase();
  for (const [fullName, abbreviation] of Object.entries(teamAbbreviations)) {
    if (
      normalizedName.includes(fullName.toLowerCase()) ||
      fullName.toLowerCase().includes(normalizedName)
    ) {
      return abbreviation;
    }
  }

  // Reglas generales de abreviación si no se encuentra en el diccionario
  let abbreviated = teamName;

  // Reglas específicas para patrones comunes
  const replacements = [
    // Patrones argentinos
    { pattern: /\bde Santiago del Estero\b/gi, replacement: "SdE" },
    { pattern: /\bde La Plata\b/gi, replacement: "LP" },
    { pattern: /\bde Santa Fe\b/gi, replacement: "SF" },
    { pattern: /\bde Córdoba\b/gi, replacement: "" },
    { pattern: /\bde Cordoba\b/gi, replacement: "" },
    { pattern: /\bde Junín\b/gi, replacement: "" },
    { pattern: /\bde Sarandí\b/gi, replacement: "" },
    { pattern: /\bClub Atlético\b/gi, replacement: "" },
    { pattern: /\bClub Atletico\b/gi, replacement: "" },
    { pattern: /\bClub Deportivo\b/gi, replacement: "" },
    { pattern: /\bClub de Fútbol\b/gi, replacement: "" },
    { pattern: /\bFútbol Club\b/gi, replacement: "" },
    { pattern: /\bFootball Club\b/gi, replacement: "" },
    { pattern: /\bFC\b/g, replacement: "" },
    { pattern: /\bCF\b/g, replacement: "" },

    // Limpiar espacios múltiples
    { pattern: /\s+/g, replacement: " " },
  ];

  // Aplicar las reglas de reemplazo
  for (const { pattern, replacement } of replacements) {
    abbreviated = abbreviated.replace(pattern, replacement);
  }

  // Limpiar espacios al inicio y final
  abbreviated = abbreviated.trim();

  // Si el nombre se hizo muy corto o vacío, devolver el original
  if (abbreviated.length < 3) {
    return teamName;
  }

  return abbreviated;
}
