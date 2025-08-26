"use client";

import { useState, useEffect, useMemo } from "react";
import HeaderBar from "@/components/dashboard/HeaderBar";
import DateSelector from "@/components/dashboard/DateSelector";
import SubNavbar from "@/components/dashboard/SubNavbar";
import LeagueSection from "@/components/dashboard/LeagueSection";
import { Match } from "@/types/match";
import { FootballApi } from "@/lib/footballApi";
import { format } from "date-fns";

interface Props {
  initialMatches?: Match[];
}

const DEFAULT_LEAGUES = [128, 129, 130, 2, 3, 848, 15];

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

  const fetchMatches = async (date: Date, leagueId: number | null, country: string | null) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      let newMatches: Match[] = [];

      if (leagueId !== null) {
        // 1) Liga específica
        newMatches = await FootballApi.getMatches(dateStr, leagueId);
      } else if (country) {
        // 2) Todas las ligas del país seleccionado
        const leagues = await FootballApi.getLeaguesByCountry(country);
        const leagueIds = leagues
          .map((l: { id?: number; league?: { id: number } }) => (l?.id ?? l?.league?.id))
          .filter((id: unknown): id is number => typeof id === "number");

        const chunks = await Promise.all(
          leagueIds.map((id: number) =>
            FootballApi.getMatches(dateStr, id).catch(() => [] as Match[])
          )
        );
        newMatches = chunks.flat();
      } else {
        // 3) Set por defecto (todas)
        newMatches = await FootballApi.getMultipleLeaguesMatches(dateStr, DEFAULT_LEAGUES);
      }

      setMatches(newMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedDate, selectedLeague, null);
  }, [selectedDate, selectedLeague]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return matches.filter((m) =>
      m.teams.home.name.toLowerCase().includes(term) ||
      m.teams.away.name.toLowerCase().includes(term)
    );
  }, [matches, searchTerm]);

  const liveCount = useMemo(
    () => filtered.filter((m) => ["1H", "2H", "LIVE", "ET", "P"].includes(m.fixture.status.short)).length,
    [filtered]
  );

  const grouped = useMemo(() => {
    return filtered.reduce<Record<number, Match[]>>((acc, m) => {
      const id = m.league.id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(m);
      return acc;
    }, {});
  }, [filtered]);

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
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white/90 px-1 mb-4">
                {leagueLabel}
              </h2>
              {Object.entries(grouped).map(([leagueId, ms]) => (
                <LeagueSection
                  key={leagueId}
                  leagueName={ms[0]?.league?.name || leagueNames[+leagueId] || `Liga ${leagueId}`}
                  leagueLogo={ms[0]?.league?.logo}
                  leagueCountry={ms[0]?.league?.country}
                  matches={ms}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white/90 px-1 mb-4">
                {leagueLabel}
              </h2>
              <LeagueSection
                leagueName={leagueLabel}
                leagueLogo={filtered[0]?.league?.logo}
                leagueCountry={filtered[0]?.league?.country}
                matches={filtered}
              />
            </div>
          )
        )}

        <div className="px-2 mt-4">
          <SubNavbar
            selectedLeague={selectedLeague}
            onLeagueChange={(id) => {
              setSelectedLeague(id);
            }}                                               // ⬅️ NUEVO
          />
        </div>
      </div>
    </div>
  );
}
