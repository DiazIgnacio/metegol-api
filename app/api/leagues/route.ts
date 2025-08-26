// app/api/leagues/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country"); // opcional

    // Unificar con el resto del proyecto:
    const apiKey = process.env.API_FOOTBALL_KEY; // <- antes: FOOTBALL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const api = new FootballApiServer(apiKey);

    if (country) {
      // Ligas por país
      const leagues = await api.getLeaguesByCountry(country);
      return NextResponse.json({ leagues });
    }

    // Si no pasás country, por ahora devolvemos arreglo vacío (o podés
    // retornar un set predefinido/caché si lo preferís).
    return NextResponse.json({ leagues: [] });
  } catch (error) {
    console.error("Leagues API Error:", error);
    return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 500 });
  }
}
