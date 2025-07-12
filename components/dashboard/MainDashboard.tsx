"use client";

import { useState, useEffect } from "react";
import HeaderBar from "@/components/dashboard/HeaderBar";
import DateSelector from "@/components/dashboard/DateSelector";
import SubNavbar from "@/components/dashboard/SubNavbar";
import MatchCard from "@/components/dashboard/MatchCard";
import { Match } from "@/types/match";
import { FootballApi } from "@/lib/footballApi";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  initialMatches?: Match[];
}

// League name mappings
const leagueNames: { [key: number]: string } = {
  128: "Liga Profesional de Futbol",
  129: "Primera Nacional",
  130: "Copa Argentina",
  2: "Champions League",
  3: "Europa League",
  848: "Conference League",
  15: "Mundial Clubes",
};

export default function MainDashboard({ initialMatches = [] }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null); // null means show all leagues
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async (date: Date, leagueId: number | null) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      let newMatches: Match[];

      if (leagueId === null) {
        // Fetch matches from ALL available leagues
        newMatches = await FootballApi.getMultipleLeaguesMatches(dateStr, [128, 129, 130, 2, 3, 848, 15]);
      } else {
        newMatches = await FootballApi.getMatches(dateStr, leagueId);
      }

      setMatches(newMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedDate, selectedLeague);
  }, [selectedDate, selectedLeague]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleLeagueChange = (leagueId: number | null) => {
    setSelectedLeague(leagueId);
  };

  const leagueName = selectedLeague ? (leagueNames[selectedLeague] || "Liga Seleccionada") : "Todas las Ligas";

  const formatSelectedDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    } else {
      return format(date, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
    }
  };

  return (
    <div className="w-full text-white">
      <HeaderBar />
      <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

      {/* Display selected date */}
      <div className="px-4 mt-3 mb-2">
        <div className="text-center">
          <span className="text-sm text-white/60">Partidos del </span>
          <span className="text-sm font-semibold text-lime-400">{formatSelectedDate(selectedDate)}</span>
        </div>
      </div>

      <div className="px-2 mt-4">
        <SubNavbar selectedLeague={selectedLeague} onLeagueChange={handleLeagueChange} />
      </div>
      <div className="space-y-4 px-2 mt-4">
        {loading && (
          <div className="text-center py-4">
            <div className="text-white/60">Cargando partidos...</div>
          </div>
        )}
        {!loading && matches.length > 0 && (
          <div>
            {selectedLeague === null ? (
              // Show matches grouped by league
              (() => {
                const groupedMatches = matches.reduce((acc, match) => {
                  const leagueId = match.league.id;
                  if (!acc[leagueId]) {
                    acc[leagueId] = [];
                  }
                  acc[leagueId].push(match);
                  return acc;
                }, {} as Record<number, Match[]>);

                return Object.entries(groupedMatches).map(([leagueId, leagueMatches]) => (
                  <div key={leagueId} className="mb-6">
                    <h3 className="text-md font-bold text-white/80 px-1 mb-1">
                      {leagueNames[parseInt(leagueId)] || `Liga ${leagueId}`}
                    </h3>
                    
                      <div className="space-y-2">
                        {leagueMatches.slice(0, 8).map((match) => (
                          <MatchCard key={match.fixture.id} match={match} />
                        ))} 
                      </div>
                  </div>
                ));
              })()
            ) : (
              // Show matches for selected league
              <div>
                <h3 className="text-md font-bold text-white/80 px-1 mb-1">{leagueName}</h3>
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <MatchCard key={match.fixture.id} match={match} />
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}
        {!loading && matches.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/60">No hay partidos disponibles para esta fecha y liga.</div>
          </div>
        )}
      </div>
    </div>
  );
}
