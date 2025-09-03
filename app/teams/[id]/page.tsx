"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, BarChart3 } from "lucide-react";
import { Team, Match } from "@/types/match";
import LeagueSection from "@/components/dashboard/LeagueSection";
import LoadingTeam from "@/components/LoadingTeam";

interface TeamDetailsProps {
  params: Promise<{ id: string }>;
}

async function getTeamDetails(teamId: string) {
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/teams/${teamId}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch team details");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching team details:", error);
    return null;
  }
}

// Tab component
function Tab({ label, active, onClick, icon }: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


function TeamStats({ matches, teamId, allowedLeagues }: { 
  matches: Match[]; 
  teamId: number; 
  allowedLeagues: string[];
}) {
  // Filter matches to only include allowed leagues for statistics
  const allowedMatches = matches.filter(match => 
    allowedLeagues.includes(match.league?.name)
  );

  const wins = allowedMatches.filter(match => {
    const isHome = match.teams.home.id === teamId;
    const teamScore = isHome ? match.goals.home : match.goals.away;
    const opponentScore = isHome ? match.goals.away : match.goals.home;
    return teamScore > opponentScore;
  }).length;

  const draws = allowedMatches.filter(match => {
    const isHome = match.teams.home.id === teamId;
    const teamScore = isHome ? match.goals.home : match.goals.away;
    const opponentScore = isHome ? match.goals.away : match.goals.home;
    return teamScore === opponentScore;
  }).length;

  const losses = allowedMatches.length - wins - draws;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Estadísticas de la Temporada</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{wins}</div>
          <div className="text-xs text-gray-400">Ganados</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400">{draws}</div>
          <div className="text-xs text-gray-400">Empates</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{losses}</div>
          <div className="text-xs text-gray-400">Perdidos</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Partidos jugados</span>
          <span className="font-medium text-white">{allowedMatches.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">% de victorias</span>
          <span className="font-medium text-white">
            {allowedMatches.length > 0 ? Math.round((wins / allowedMatches.length) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailsPage({ params }: TeamDetailsProps) {
  const { id } = use(params);
  const [data, setData] = useState<{team: Team, matches: Match[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matches" | "stats">("matches");

  // Same logic as SimpleMatchCard for allowed leagues
  const allowedLeagues = [
    "Copa de la Liga Profesional",
    "Liga Profesional Argentina", 
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getTeamDetails(id);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingTeam />;
  }
  
  if (!data || !data.team) {
    return (
      <div className="h-screen flex flex-col px-2 text-white font-sans">
        <div className="bg-black rounded p-4 mb-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
        </div>
        
        <div className="bg-[#222222] border border-transparent rounded-2xl p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-2">Equipo no encontrado</h1>
            <p className="text-gray-400 mb-4">No se pudo cargar la información del equipo.</p>
          </div>
        </div>
      </div>
    );
  }

  const { team, matches } = data;

  // Group matches by league
  const groupedMatches = matches.reduce<Record<number, Match[]>>((acc, match) => {
    const leagueId = match.league.id;
    if (!acc[leagueId]) acc[leagueId] = [];
    acc[leagueId].push(match);
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col px-2 text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-black rounded p-4 mb-2">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-white hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Image
            src={team.logo}
            alt={team.name}
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-white">{team.name}</h1>
            <p className="text-gray-400 text-sm">Últimos partidos en todas las competencias</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#222222] border border-transparent rounded-2xl p-4 flex-1 overflow-hidden">
        <div className="h-full flex flex-col space-y-4">
          {/* Tabs */}
          <div className="flex space-x-2">
            <Tab
              label="Partidos"
              active={activeTab === "matches"}
              onClick={() => setActiveTab("matches")}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Tab
              label="Estadísticas"
              active={activeTab === "stats"}
              onClick={() => setActiveTab("stats")}
              icon={<BarChart3 className="w-4 h-4" />}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "stats" ? (
              <div className="h-full overflow-y-auto scrollbar-hide pb-8">
                <TeamStats matches={matches} teamId={team.id} allowedLeagues={allowedLeagues} />
                
                {/* Additional team statistics can go here */}
                <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Rendimiento por Competencia</h4>
                  <div className="space-y-3">
                    {Object.entries(groupedMatches)
                      .filter(([, leagueMatches]) => 
                        allowedLeagues.includes(leagueMatches[0]?.league?.name)
                      )
                      .length > 0 ? (
                      Object.entries(groupedMatches)
                        .filter(([, leagueMatches]) => 
                          allowedLeagues.includes(leagueMatches[0]?.league?.name)
                        )
                        .map(([leagueId, leagueMatches]) => {
                        const firstMatch = leagueMatches[0];
                        const wins = leagueMatches.filter(match => {
                          const isHome = match.teams.home.id === team.id;
                          const teamScore = isHome ? match.goals.home : match.goals.away;
                          const opponentScore = isHome ? match.goals.away : match.goals.home;
                          return teamScore > opponentScore;
                        }).length;
                        
                        const draws = leagueMatches.filter(match => {
                          const isHome = match.teams.home.id === team.id;
                          const teamScore = isHome ? match.goals.home : match.goals.away;
                          const opponentScore = isHome ? match.goals.away : match.goals.home;
                          return teamScore === opponentScore;
                        }).length;
                        
                        const losses = leagueMatches.length - wins - draws;
                        
                        return (
                          <div key={leagueId} className="border border-gray-600 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-medium">{firstMatch.league.name}</h5>
                              <span className="text-gray-400 text-sm">{leagueMatches.length} partidos</span>
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <span className="text-green-400">G: {wins}</span>
                              <span className="text-yellow-400">E: {draws}</span>
                              <span className="text-red-400">P: {losses}</span>
                            </div>
                          </div>
                        );
                        })
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        No hay estadísticas disponibles para las competencias principales.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                
                {matches.length > 0 ? (
                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="space-y-4 pb-8">
                      {Object.entries(groupedMatches).map(([leagueId, leagueMatches]) => {
                        const firstMatch = leagueMatches[0];
                        return (
                          <LeagueSection
                            key={leagueId}
                            leagueName={firstMatch.league.name}
                            leagueLogo={firstMatch.league.logo}
                            leagueCountry={firstMatch.league.country}
                            matches={leagueMatches} // Show all matches, not limited
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No hay partidos disponibles para este equipo.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}