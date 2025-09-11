import { NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

const footballApi = new FootballApiServer(process.env.FOOTBALL_API_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get("fixture");
  const homeId = searchParams.get("home");
  const awayId = searchParams.get("away");
  const teamId = searchParams.get("team");

  if (!fixtureId) {
    return NextResponse.json(
      { error: "Missing fixture param" },
      { status: 400 }
    );
  }

  if (!homeId) {
    return NextResponse.json(
      { error: "Missing home team param" },
      { status: 400 }
    );
  }

  if (!awayId) {
    return NextResponse.json(
      { error: "Missing away team param" },
      { status: 400 }
    );
  }

  try {
    const lineups = await footballApi.getMatchLineups(
      fixtureId,
      homeId,
      awayId
    );

    if (teamId) {
      const requestedTeamId = parseInt(teamId);
      const filteredLineups = [];
      if (lineups.home?.team.id === requestedTeamId)
        filteredLineups.push(lineups.home);
      if (lineups.away?.team.id === requestedTeamId)
        filteredLineups.push(lineups.away);
      return NextResponse.json(filteredLineups);
    }

    const result = [lineups.home, lineups.away].filter(Boolean);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Lineup API Error:", e);
    return NextResponse.json(
      { error: "Failed to fetch lineups" },
      { status: 500 }
    );
  }
}
