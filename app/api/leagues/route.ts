import { NextResponse } from "next/server";
import { FootballApiServer } from "@/lib/footballApi";

export async function GET() {
    try {
        const apiKey = process.env.FOOTBALL_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        const footballApi = new FootballApiServer(apiKey);
        const leagues = await footballApi.getLeaguesByCountry("Argentina");
        
        return NextResponse.json({ leagues });
    } catch (error) {
        console.error("Error fetching leagues:", error);
        return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 500 });
    }
}