"use client";

import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import type { Match } from "@/types/match";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLineups } from "@/hooks/useLineups";

const STATISTICS_LABELS_ES: { [key: string]: string } = {
  "Shots on Goal": "Tiros al arco",
  "Shots off Goal": "Tiros desviados",
  "Total Shots": "Total de tiros",
  "Blocked Shots": "Tiros bloqueados",
  "Shots insidebox": "Tiros dentro del área",
  "Shots outsidebox": "Tiros fuera del área",
  "Fouls": "Faltas",
  "Corner Kicks": "Tiros de esquina",
  "Offsides": "Offsides",
  "Ball Possession": "Posesión de balón",
  "Yellow Cards": "Tarjetas amarillas",
  "Red Cards": "Tarjetas rojas",
  "Goalkeeper Saves": "Atajadas del arquero",
  "Total passes": "Pases totales",
  "Passes accurate": "Pases precisos",
  "Passes %": "Precisión de pases",
  "expected_goals": "Goles esperados",
  "goals_prevented": "Goles evitados",
};

function getStat(label: string, stats?: { type: string; value: string | number | null }[]) {
  const found = stats?.find((s) => s.type === label);
  return found && found.value != null ? Number(found.value) : 0;
}

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'lineup' | 'extra'>('stats');

  const home = match.teams.home;
  const away = match.teams.away;

  const isLive = ["1H", "2H", "LIVE"].includes(match.fixture.status.short);
  const isFinished = match.fixture.status.short === "FT";
  const isUpcoming = match.fixture.status.short === "NS";

  const formatMinute = () => {
    return isLive
      ? `${match.fixture.status.elapsed}'`
      : isUpcoming
      ? format(new Date(match.fixture.date), "HH:mm", { locale: es })
      : "";
  };

  const events = useMemo(() => {
    return {
      goalsHome: match.events?.home.filter((e) => e.type === "Goal") || [],
      goalsAway: match.events?.away.filter((e) => e.type === "Goal") || [],
      yellowHome: match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Yellow")) || [],
      redHome: match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Red")) || [],
      yellowAway: match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Yellow")) || [],
      redAway: match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Red")) || [],
    };
  }, [match]);

  const { lineups, loading } = useLineups(match.fixture.id, match.teams.home.id, match.teams.away.id);
  const hasLineup = !!lineups.home?.startXI?.length || !!lineups.away?.startXI?.length;

  const hasDetailedStats = (match.statistics?.home?.length ?? 0) > 0 && (match.statistics?.away?.length ?? 0) > 0;

  const homeShots = getStat("Total Shots", match.statistics?.home);
  const awayShots = getStat("Total Shots", match.statistics?.away);
  const totalGoals = match.goals.home + match.goals.away;
  const totalCards = events.yellowHome.length + events.redHome.length + events.yellowAway.length + events.redAway.length;
  const elapsed = match.fixture.status.elapsed || 0;

  let score = 0;
  score += (homeShots + awayShots) * 1.5;
  score += totalGoals * 8;
  score += totalCards * 1;
  score += elapsed / 6;
  const fuegoNivel = Math.min(5, Math.floor(score / 10));

  const getBarStyle = (val: number, max = 100) => ({ width: `${(val / max) * 100}%` });

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 text-white w-full max-w-md mx-auto border border-gray-700">
      {/* Picantómetro */}
      {fuegoNivel > 0 && (
        <div className="text-sm text-orange-400 font-semibold flex items-center gap-1 mb-2">
          <span className="text-white/70 ml-2">Picantómetro:</span>
          {"🔥".repeat(fuegoNivel)}
        </div>
      )}

      {/* Estado y tiempo */}
      <div className="flex justify-between items-center text-xs text-white/60 mb-2">
        <span>{isLive ? "Live" : isFinished ? "Finalizado" : ""}</span>
        <span className="font-semibold text-white">{formatMinute()}</span>
      </div>

      {/* Equipos + score */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 max-w-[110px]" title={home.name}>
          <span className="truncate">{home.name}</span>
          <Image src={home.logo} width={20} height={20} alt={home.name} />
        </div>
        <div className="text-xl font-bold">{match.goals.home} - {match.goals.away}</div>
        <div className="flex items-center gap-2 justify-end max-w-[110px]" title={away.name}>
          <Image src={away.logo} width={20} height={20} alt={away.name} />
          <span className="truncate text-right">{away.name}</span>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="flex justify-between text-xs text-white/80 mt-2 px-2">
        <div className="flex gap-2">
          <span>🟨 {events.yellowHome.length}</span>
          <span>🟥 {events.redHome.length}</span>
        </div>
        <div className="flex gap-2">
          <span>🟥 {events.redAway.length}</span>
          <span>🟨 {events.yellowAway.length}</span>
        </div>
      </div>

      {/* Goles */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-white/90">
        <div className="flex flex-col items-start">
          {events.goalsHome.map((e, i) => (
            <span key={i}>⚽ {e.time.elapsed}' {e.player.name}</span>
          ))}
        </div>
        <div className="flex flex-col items-end">
          {events.goalsAway.map((e, i) => (
            <span key={i}>{e.player.name} {e.time.elapsed}' ⚽</span>
          ))}
        </div>
      </div>

      {/* Botón desplegar */}
      {(hasDetailedStats || hasLineup) && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-xs text-white/60 hover:text-white flex items-center gap-1 mx-auto"
          >
            {isExpanded ? "Ocultar" : "Ver más"}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* Tabs: Stats / Lineup / Extra */}
      {isExpanded && (
        <div className="mt-3 bg-[#2a2a2a] rounded-lg p-2">
          <div className="flex justify-around text-xs text-white/60 border-b border-gray-600 mb-2">
            <button onClick={() => setActiveTab("stats")} className={activeTab === "stats" ? "text-white" : ""}>Estadísticas</button>
            <button onClick={() => setActiveTab("lineup")} className={activeTab === "lineup" ? "text-white" : ""} disabled={!hasLineup && !loading}>Formación</button>
            <button onClick={() => setActiveTab("extra")} className={activeTab === "extra" ? "text-white" : ""}>Próximamente</button>
          </div>

          {/* Stats Tab */}
          {activeTab === "stats" && hasDetailedStats && (
            <div className="space-y-2 text-xs text-white/80">
              {match.statistics?.home.map((stat, i) => {
                const awayStat = match.statistics?.away[i];
                const label = STATISTICS_LABELS_ES[stat.type] ?? stat.type;
                const isBar = ["Ball Possession", "Passes %", "expected_goals"].includes(stat.type);

                const valHome = parseFloat(stat.value?.toString() || "0");
                const valAway = parseFloat(awayStat?.value?.toString() || "0");

                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="w-1/3 text-left">{stat.value}</span>
                      <span className="w-1/3 text-center text-white/60">{label}</span>
                      <span className="w-1/3 text-right">{awayStat?.value}</span>
                    </div>
                    {isBar && (
                      <div className="flex gap-1 h-2 rounded overflow-hidden bg-gray-700">
                        <div className="bg-green-500" style={getBarStyle(valHome, valHome + valAway)} />
                        <div className="bg-blue-500" style={getBarStyle(valAway, valHome + valAway)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Lineup Tab */}
          {activeTab === "lineup" && (
            <div className="text-xs text-white/90 space-y-3">
              {loading && <p className="text-center text-white/60">Cargando formaciones...</p>}
              {!loading && hasLineup ? (
                <>
                  <div>
                    <h4 className="text-white/70">{home.name} ({lineups.home?.formation})</h4>
                    <ul className="list-disc ml-5">
                      {lineups.home?.startXI?.map((p, idx) => (
                        <li key={idx}>#{p.player.number} {p.player.name}</li>
                      ))}
                    </ul>
                    {(lineups.home && lineups.home.substitutes?.length > 0) && (
                      <>
                        <p className="mt-1 text-white/60">Suplentes:</p>
                        <ul className="list-disc ml-5">
                          {lineups.home.substitutes.map((p, idx) => (
                            <li key={idx}>#{p.player.number} {p.player.name}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white/70">{away.name} ({lineups.away?.formation})</h4>
                    <ul className="list-disc ml-5">
                      {lineups.away?.startXI?.map((p, idx) => (
                        <li key={idx}>#{p.player.number} {p.player.name}</li>
                      ))}
                    </ul>
                    {lineups.away?.substitutes && lineups.away.substitutes.length > 0 && (
                      <>
                        <p className="mt-1 text-white/60">Suplentes:</p>
                        <ul className="list-disc ml-5">
                          {lineups.away.substitutes.map((p, idx) => (
                            <li key={idx}>#{p.player.number} {p.player.name}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              ) : (
                !loading && <p className="text-center text-white/60">No hay formación disponible.</p>
              )}
            </div>
          )}

          {/* Extra Tab */}
          {activeTab === "extra" && (
            <div className="text-white/50 text-xs text-center">Esta sección estará disponible próximamente.</div>
          )}
        </div>
      )}
    </div>
  );
}
