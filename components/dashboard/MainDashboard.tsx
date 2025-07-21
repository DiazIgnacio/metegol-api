"use client";

import { useState, useEffect } from "react";
import HeaderBar from "@/components/dashboard/HeaderBar";
import DateSelector from "@/components/dashboard/DateSelector";
import SubNavbar from "@/components/dashboard/SubNavbar";
import MatchCard from "@/components/dashboard/MatchCard";
import { Match } from "@/types/match";
import { FootballApi } from "@/lib/footballApi";
import { format } from "date-fns";

interface Props {
  initialMatches?: Match[];
}

const leagueNames: Record<number, string> = {
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
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMatches = async (date: Date, leagueId: number | null) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      let newMatches: Match[];
      if (leagueId === null) {
        newMatches = await FootballApi.getMultipleLeaguesMatches(dateStr, [
          128, 129, 130, 2, 3, 848, 15,
        ]);
      } else {
        newMatches = await FootballApi.getMatches(dateStr, leagueId);
      }
      setMatches(newMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedDate, selectedLeague);
  }, [selectedDate, selectedLeague]);

  const filtered = matches.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.teams.home.name.toLowerCase().includes(term) ||
      m.teams.away.name.toLowerCase().includes(term)
    );
  });

  const liveCount = filtered.filter(
    (m) => m.fixture.status.short === "Live"
  ).length;

  const grouped = filtered.reduce<Record<number, Match[]>>((acc, m) => {
    const id = m.league.id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(m);
    return acc;
  }, {});

  const leagueLabel =
    selectedLeague !== null
      ? leagueNames[selectedLeague] || `Liga ${selectedLeague}`
      : "Todas las Ligas";

  return (
    <div className="w-full text-white">
      <HeaderBar
        liveCount={liveCount}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />

      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <div className="space-y-4 px-2 mt-4">
        {loading && (
          <div className="text-center py-4 text-white/60">
            Cargando partidos...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No hay partidos que coincidan con tu búsqueda.
          </div>
        )}

        {!loading && filtered.length > 0 && (
          selectedLeague === null ? (
            Object.entries(grouped).map(([leagueId, ms]) => (
              <div key={leagueId} className="mb-6">
                <h3 className="text-md font-bold text-white/80 px-1 mb-1">
                  {leagueNames[+leagueId] || `Liga ${leagueId}`}
                </h3>
                <div className="space-y-2">
                  {ms.map((m) => (
                    <MatchCard key={m.fixture.id} match={m} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>
              <h3 className="text-md font-bold text-white/80 px-1 mb-1">
                {leagueLabel}
              </h3>
              <div className="space-y-2">
                {filtered.map((m) => (
                  <MatchCard key={m.fixture.id} match={m} />
                ))}
              </div>
            </div>
          )
        )}

        <div className="px-2 mt-4">
          <SubNavbar
            selectedLeague={selectedLeague}
            onLeagueChange={setSelectedLeague}
          />
        </div>
      </div>
    </div>
  );
}
