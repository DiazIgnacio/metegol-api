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

  // Stats for basic info
  const yellowsHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
  const redsHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;
  const yellowsAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
  const redsAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;
  
  const possHome = getStat(match.statistics?.home, "Ball Possession");
  const possAway = getStat(match.statistics?.away, "Ball Possession");
  
  const goalsHome = match.events?.home.filter((e) => e.type === "Goal") || [];
  const goalsAway = match.events?.away.filter((e) => e.type === "Goal") || [];

  const formatTime = () => {
    if (isLive) return `${match.fixture.status.elapsed}&apos;`;
    if (isUpcoming) return new Date(match.fixture.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    if (isFinished) return "FT";
    return "";
  };

  return (
    <div className="bg-[#181c23] rounded-lg border border-[#2a2e39] overflow-hidden">
      {/* Main Match Row - Clickable */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#1f2329] transition-colors"
        onClick={() => setShowBasicInfo(!showBasicInfo)}
      >
        {/* Time/Status */}
        <div className="w-16 text-center">
          <span className={`text-sm font-bold ${
            isLive ? "text-[#00ff7f]" : 
            isFinished ? "text-white/60" : 
            "text-[#ffe066]"
          }`}>
            {formatTime()}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Image src={home.logo} alt={home.name} width={24} height={24} className="rounded-full bg-white" />
          <span className="truncate text-sm font-semibold text-white">{home.name}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 px-4">
          <span className="text-lg font-bold text-white">
            {isUpcoming ? "—" : match.goals.home}
          </span>
          <span className="text-lg font-bold text-white/60">—</span>
          <span className="text-lg font-bold text-white">
            {isUpcoming ? "—" : match.goals.away}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="truncate text-sm font-semibold text-white text-right">{away.name}</span>
          <Image src={away.logo} alt={away.name} width={24} height={24} className="rounded-full bg-white" />
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

      {/* Basic Info Section */}
      {showBasicInfo && (
        <div className="px-3 pb-3 bg-[#0f1419] border-t border-[#2a2e39]">
          {/* Cards and Possession */}
          <div className="grid grid-cols-3 gap-4 mb-3 text-xs text-white/80">
            {/* Home Team Cards */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-white/60 text-[10px]">{match.teams.home.name}</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span>🟨</span>
                  <span>{yellowsHome}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🟥</span>
                  <span>{redsHome}</span>
                </div>
              </div>
            </div>

            {/* Possession */}
            <div className="text-center">
              <div className="text-white/60 mb-1">Posesión</div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold">{possHome}</span>
                <span className="text-white/40">—</span>
                <span className="font-semibold">{possAway}</span>
              </div>
            </div>

            {/* Away Team Cards */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-white/60 text-[10px]">{match.teams.away.name}</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span>🟨</span>
                  <span>{yellowsAway}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🟥</span>
                  <span>{redsAway}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          {(goalsHome.length > 0 || goalsAway.length > 0) && (
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="flex flex-col gap-1">
                {goalsHome.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90">
                    <span>⚽</span>
                    <span>{goal.time.elapsed}&apos;</span>
                    <span>{goal.player.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 items-end">
                {goalsAway.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90">
                    <span>{goal.player.name}</span>
                    <span>{goal.time.elapsed}&apos;</span>
                    <span>⚽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ver Más Button */}
          <div className="flex justify-center">
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
      )}

      {/* Advanced Section with Tabs */}
      {showBasicInfo && showAdvanced && (
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
      )}
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
      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
        active
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
          {minute ? `${minute}&apos;` : "Partido no iniciado"}
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

// Función para traducir detalles de eventos al español  
function translateEventDetail(detail?: string): string {
  if (!detail) return '';
  
  const translations: Record<string, string> = {
    'Yellow Card': 'Amarilla',
    'Red Card': 'Roja', 
    'Second Yellow card': 'Segunda amarilla',
    'Normal Goal': 'Gol normal',
    'Penalty': 'Penal',
    'Own Goal': 'Autogol',
    'Header': 'Cabezazo',
    'Left foot': 'Pie izquierdo',
    'Right foot': 'Pie derecho',
    'Free kick': 'Tiro libre',
    'Corner': 'Córner',
    'Missed Penalty': 'Penal errado'
  };
  
  return translations[detail] || detail;
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
        const translatedDetail = translateEventDetail(e?.detail);
        
        return (
          <div key={i} className="flex items-center justify-between text-xs text-white/75 py-1 border-b border-white/10">
            <span className="text-white/60 w-8">{e?.time?.elapsed ?? "—"}&apos;</span>
            <span className="flex-1 mx-2">
              {translatedType} {translatedDetail && `• ${translatedDetail}`}
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