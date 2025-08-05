// lib/server/match-fetcher.ts

import { FootballApi } from "@/lib/footballApi";
import type { Match } from "@/types/match";

/**
 * Esta función se ejecuta del lado del servidor.
 * Podés controlar el caché desde acá si usás fetch directo.
 */
export async function getMatches(): Promise<Match[]> {
  return await FootballApi.getMatches(); // Ya llama a tu `/api/team-matches`
}


