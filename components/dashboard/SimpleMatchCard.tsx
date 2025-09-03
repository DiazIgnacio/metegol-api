"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Match } from "@/types/match";
import { Lineups } from "@/components/Lineups";

const getStat = (
  stats: { type: string; value: string | number | null }[] | undefined,
  type: string
) => {
  const f = stats?.find((s) => s.type === type);
  return f?.value ?? "—";
};

interface Props {
  match: Match;
}

export default function SimpleMatchCard({ match }: Props) {
  const [showBasicInfo, setShowBasicInfo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "lineup" | "timeline">("map");

  const home = match.teams.home;
  const away = match.teams.away;

  const isLive = ["1H", "2H", "LIVE", "ET", "P"].includes(match.fixture.status.short);
  const isFinished = match.fixture.status.short === "FT";
  const isUpcoming = match.fixture.status.short === "NS";

  // Debug logging for problematic matches
  if (match.teams.home.name.includes("Kairat") || match.teams.home.name.includes("Celtic") ||
    match.teams.away.name.includes("Kairat") || match.teams.away.name.includes("Celtic")) {
    console.log('SIMPLE MATCH DEBUG:', {
      teams: `${match.teams.home.name} vs ${match.teams.away.name}`,
      fixtureId: match.fixture.id,
      status: match.fixture.status.short,
      elapsed: match.fixture.status.elapsed,
      isLive,
      officialGoals: { home: match.goals.home, away: match.goals.away },
      homeTeamId: match.teams.home.id,
      awayTeamId: match.teams.away.id,
      homeEvents: match.events?.home.length || 0,
      awayEvents: match.events?.away.length || 0,
      homeGoals: match.events?.home.filter(e => e.type === "Goal") || [],
      awayGoals: match.events?.away.filter(e => e.type === "Goal") || []
    });
  }

  // Stats for basic info
  const yellowsHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
  const redsHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;
  const yellowsAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
  const redsAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;


  // Filter out missed penalties from penalty shootout
  const goalsHome = match.events?.home.filter((e) =>
    e.type === "Goal" &&
    !(e.detail === "Missed Penalty" && e.comments === "Penalty Shootout")
  ) || [];

  const goalsAway = match.events?.away.filter((e) =>
    e.type === "Goal" &&
    !(e.detail === "Missed Penalty" && e.comments === "Penalty Shootout")
  ) || [];

  const formatTime = () => {
    if (isLive) {
      const minute = match.fixture.status.elapsed;
      if (minute !== null && minute !== undefined) {
        return `${minute}’`;
      }
      return "EN VIVO";
    }

    if (isUpcoming) {
      return new Date(match.fixture.date).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 🔑 Esto fuerza el formato 24hs
      });
    }

    if (isFinished) return "";
    return "";
  };

  const allowedLeagues = [
    "Copa de la Liga Profesional",
    "Liga Profesional Argentina",
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
  ];

  const leagueName = match.league?.name;
  const homeShots = getStat(match.statistics?.home, "Total Shots");
  const awayShots = getStat(match.statistics?.away, "Total Shots");

  const possHome = getStat(match.statistics?.home, "Ball Possession");
  const possAway = getStat(match.statistics?.away, "Ball Possession");


  return (
    <div className="bg-[#181c23] rounded-lg border border-[#2a2e39] overflow-hidden">
      {/* Main Match Row - Clickable */}
      <div
        className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-[#1f2329] transition-colors"
        onClick={() => setShowBasicInfo(!showBasicInfo)}
      >
        {/* Time/Status */}
        <div className="w-16 text-center">
          {!isFinished && (
            <span
              className={`text-xs font-bold ${isLive ? "text-[#c3cc5a]" : isUpcoming ? "text-white" : "text-white/60"
                }`}
            >
              {formatTime()}
            </span>
          )}
        </div>

        {/* Match Layout: Home Team - Logo - Score - Logo - Away Team */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="text-xs font-semibold text-white break-words leading-tight text-right flex-1">{home.name}</span>
            <Image src={home.logo} alt={home.name} width={24} height={24} className="rounded-full bg-white flex-shrink-0" />

            <div className="flex items-center gap-1 px-2">
              <span className="text-lg font-bold text-white">
                {isUpcoming ? "—" : match.goals.home}
              </span>
              <span className="text-lg font-bold text-white/60">—</span>
              <span className="text-lg font-bold text-white">
                {isUpcoming ? "—" : match.goals.away}
              </span>
            </div>

            <Image src={away.logo} alt={away.name} width={24} height={24} className="rounded-full bg-white flex-shrink-0" />
            <span className="text-xs font-semibold text-white break-words leading-tight text-left flex-1">{away.name}</span>
          </div>
          {!isUpcoming &&
            allowedLeagues.includes(leagueName) &&
            homeShots !== null &&
            homeShots !== undefined &&
            awayShots !== null &&
            awayShots !== undefined && (
              <div className="flex items-center text-[10px] text-white/60">
                <span>({homeShots})</span>
                <span>—</span>
                <span>({awayShots})</span>
              </div>
            )}
        </div>

        {/* Expand Icon */}
        <div className="w-8 flex justify-center">
          {showBasicInfo ? (
            <ChevronUp size={16} className="text-white/60" />
          ) : (
            <ChevronDown size={16} className="text-white/60" />
          )}
        </div>
      </div>

      {/* Cards and Possession Row - Always visible when match has started */}
      {!isUpcoming && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f1419] border-t border-[#2a2e39] text-xs">
          {/* Home Team Cards */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span>🟨</span>
              <span className="text-white/80">{yellowsHome}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🟥</span>
              <span className="text-white/80">{redsHome}</span>
            </div>
          </div>

          {/* Possession */}
          {
            (possHome !== "—" && possAway !== "—") && (
              <div className="flex items-center gap-2 text-white/80">
                <span className="font-semibold">{possHome}</span>
                <span className="text-white/50 text-[10px]">POSESIÓN</span>
                <span className="font-semibold">{possAway}</span>
              </div>
            )
          }

          {/* Away Team Cards */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span>🟥</span>
              <span className="text-white/80">{redsAway}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🟨</span>
              <span className="text-white/80">{yellowsAway}</span>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showBasicInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-3 pb-3 bg-[#0f1419] border-t border-[#2a2e39]">

          {/* Goals */}
          {(goalsHome.length > 0 || goalsAway.length > 0) && (
            <div className="grid grid-cols-2 mt-2 gap-3 mb-3 text-xs">
              <div className="flex flex-col gap-1">
                {goalsHome.map((goal, i) => {
                  const isPenalty = goal.detail === "Penalty" && goal.comments !== "Penalty Shootout";
                  const isPenaltyShootout = goal.detail === "Penalty" && goal.comments === "Penalty Shootout";
                  const timeDisplay = isPenaltyShootout ? "PEN" : `${goal.time.elapsed}mins`;
                  return (
                    <div key={i} className="flex items-center text-sm gap-2 text-white/90">
                      <span>{isPenalty ? "⚽🥅" : isPenaltyShootout ? "⚽🏆" : "⚽"}</span>
                      <span>{timeDisplay}</span>
                      <span>{goal.player.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1 items-end">
                {goalsAway.map((goal, i) => {
                  const isPenalty = goal.detail === "Penalty" && goal.comments !== "Penalty Shootout";
                  const isPenaltyShootout = goal.detail === "Penalty" && goal.comments === "Penalty Shootout";
                  const timeDisplay = isPenaltyShootout ? "PEN" : `${goal.time.elapsed}mins`;
                  return (
                    <div key={i} className="flex items-center text-sm gap-2 text-white/90">
                      <span>{goal.player.name}</span>
                      <span>{timeDisplay}</span>
                      <span>{isPenalty ? "⚽🥅" : isPenaltyShootout ? "⚽🏆" : "⚽"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ver Más Button */}
          <div className="flex justify-end mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAdvanced(!showAdvanced);
              }}
              className="text-xs font-semibold text-[#51ff9c] hover:text-[#66ff99] transition-colors"
            >
              {showAdvanced ? "OCULTAR DETALLES" : "VER MÁS"}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Section with Tabs */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showBasicInfo && showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-3 pb-3 bg-[#0a0e13] border-t border-[#2a2e39]">
          {/* Tabs */}
          <div className="flex text-xs mb-3 gap-1">
            <Tab
              label="MAPA"
              active={activeTab === "map"}
              onClick={() => setActiveTab("map")}
            />
            <Tab
              label="FORMACIONES"
              active={activeTab === "lineup"}
              onClick={() => setActiveTab("lineup")}
            />
            <Tab
              label="CRONOLOGÍA"
              active={activeTab === "timeline"}
              onClick={() => setActiveTab("timeline")}
            />
          </div>

          {/* Tab Content */}
          <div className="bg-[#0f1319] border border-[#2a2e39] rounded-lg p-3">
            {activeTab === "map" && (
              <LiveMap minute={isLive ? (match.fixture.status.elapsed ?? null) : null} />
            )}
            {activeTab === "lineup" && (
              <div className="text-xs text-white/90">
                <Lineups
                  fixtureId={match.fixture.id}
                  homeId={match.teams.home.id}
                  awayId={match.teams.away.id}
                />
              </div>
            )}
            {activeTab === "timeline" && (
              <Timeline
                events={[
                  ...(match.events?.home ?? []).map((e) => ({ ...e, side: "home" as const })),
                  ...(match.events?.away ?? []).map((e) => ({ ...e, side: "away" as const })),
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${active
        ? "bg-[#2563eb] text-white"
        : "bg-[#1a1f28] text-white/60 hover:text-white hover:bg-[#202634]"
        }`}
    >
      {label}
    </button>
  );
}

function LiveMap({ minute }: { minute: number | null }) {
  return (
    <div className="h-32 bg-[#16331e] rounded-lg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(#1c3b24 1px, transparent 1px), linear-gradient(90deg, #1c3b24 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}>
      </div>
      <div className="text-xs text-white/70 text-center z-10">
        <div className="mb-1">Mapa de juego en vivo</div>
        <div className="text-[#66e192] font-semibold">
          {minute ? `${minute}mins` : "Partido no iniciado"}
        </div>
      </div>
    </div>
  );
}

// Función para traducir tipos de eventos al español
function translateEventType(type?: string): string {
  const translations: Record<string, string> = {
    'Goal': 'Gol',
    'Card': 'Tarjeta',
    'subst': 'Cambio',
    'Substitution': 'Cambio',
    'Penalty': 'Penal',
    'Own Goal': 'Gol en contra',
    'Miss': 'Fallo',
    'Red Card': 'Tarjeta roja',
    'Yellow Card': 'Tarjeta amarilla',
    'Var': 'VAR',
    'Goal Kick': 'Saque de arco',
    'Corner Kick': 'Córner',
    'Free Kick': 'Tiro libre',
    'Throw-in': 'Lateral',
    'Offside': 'Offside',
    'Foul': 'Falta'
  };

  return translations[type || ''] || type || '';
}


function Timeline({ events }: { events: Array<Record<string, unknown>> }) {
  if (!events.length) {
    return (
      <div className="text-center text-white/50 text-xs py-4">
        Sin eventos disponibles
      </div>
    );
  }

  const sorted = events.sort((a, b) => {
    const aTime = (a as { time?: { elapsed?: number } })?.time?.elapsed ?? 0;
    const bTime = (b as { time?: { elapsed?: number } })?.time?.elapsed ?? 0;
    return aTime - bTime;
  });

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {sorted.map((event, i) => {
        const e = event as {
          time?: { elapsed?: number };
          type?: string;
          detail?: string;
          player?: { name?: string };
          side?: string;
        };

        const translatedType = translateEventType(e?.type);

        return (
          <div key={i} className="flex items-center justify-between text-xs space-x-2 text-white/75 py-1 border-b border-white/10">
            <span className="text-white/60 w-8">{e?.time?.elapsed ?? "—"}mins</span>
            <span className="flex-1 mx-2">
              | {translatedType}
            </span>
            <span className="text-right text-white/80 truncate max-w-[100px]">
              {e?.player?.name ?? "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}