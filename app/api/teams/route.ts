import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // For now, return a basic list of common teams since team search isn't fully implemented
    // This could be expanded with proper team caching and search functionality
    const commonTeams = [
      {
        id: 435,
        name: "River Plate",
        logo: "https://media.api-sports.io/football/teams/435.png",
      },
      {
        id: 451,
        name: "Boca Juniors",
        logo: "https://media.api-sports.io/football/teams/451.png",
      },
      {
        id: 433,
        name: "Racing Club",
        logo: "https://media.api-sports.io/football/teams/433.png",
      },
      {
        id: 450,
        name: "Independiente",
        logo: "https://media.api-sports.io/football/teams/450.png",
      },
      {
        id: 434,
        name: "San Lorenzo",
        logo: "https://media.api-sports.io/football/teams/434.png",
      },
      {
        id: 447,
        name: "Estudiantes",
        logo: "https://media.api-sports.io/football/teams/447.png",
      },
      {
        id: 440,
        name: "Vélez Sarsfield",
        logo: "https://media.api-sports.io/football/teams/440.png",
      },
      {
        id: 1062,
        name: "Talleres",
        logo: "https://media.api-sports.io/football/teams/1062.png",
      },
      {
        id: 1063,
        name: "Lanús",
        logo: "https://media.api-sports.io/football/teams/1063.png",
      },
      {
        id: 1064,
        name: "Argentinos Juniors",
        logo: "https://media.api-sports.io/football/teams/1064.png",
      },
    ];

    // If search parameter exists, filter teams by name
    let teams = commonTeams;
    if (search) {
      const searchTerm = search.toLowerCase();
      teams = commonTeams.filter(team =>
        team.name.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json({
      teams: teams.slice(0, 10), // Limit to 10 results for dropdown
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
