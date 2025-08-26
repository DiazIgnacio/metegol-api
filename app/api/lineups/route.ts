import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get("fixture");
  const teamId = searchParams.get("team"); // opcional

  // Validación de parámetros
  if (!fixtureId) {
    return NextResponse.json({ error: "Missing fixture param" }, { status: 400 });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  // Construcción de la query
  const query = new URLSearchParams({ fixture: fixtureId });
  if (teamId) query.append("team", teamId);

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures/lineups?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": apiKey
        }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: response.status });
    }

    const data = await response.json();
    // data.response será un array con las alineaciones de cada equipo
    return NextResponse.json(data.response);
    console.log("Lineups fetched successfully:", data.response);
  } catch (e) {
    console.error("Lineup API Error:", e);
    return NextResponse.json({ error: "Failed to fetch lineups" }, { status: 500 });
  }
}
