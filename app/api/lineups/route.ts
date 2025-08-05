import { NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi"; // asegurate de que esté importado correctamente
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get("fixture");
  const homeId = searchParams.get("home");
  const awayId = searchParams.get("away");

  if (!fixtureId || !homeId || !awayId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const api = new FootballApiServer(apiKey);

  try {
    const { home, away } = await api.getMatchLineups({
      fixture: { id: Number(fixtureId), date: "", status: { short: "", long: "" } },
      teams: {
        home: { id: Number(homeId), name: "", logo: "" },
        away: { id: Number(awayId), name: "", logo: "" },
      },
    } as any); // tipo parcial de Match para que compile

    return NextResponse.json({ home, away });
  } catch (e) {
    console.error("Lineup API Error:", e);
    return NextResponse.json({ error: "Failed to fetch lineups" }, { status: 500 });
  }
}
