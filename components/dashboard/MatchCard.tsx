"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Match } from "@/types/match";
import { Lineups } from "@/components/Lineups";

const LIVE_STATES = ["1H", "2H", "LIVE", "ET", "P"];

const getStat = (
  stats: { type: string; value: string | number | null }[] | undefined,
  type: string
) => {
  const f = stats?.find((s) => s.type === type);
  return f?.value ?? null;
};

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"map" | "lineup" | "timeline">("map");

  const isLive = LIVE_STATES.includes(match.fixture.status.short);
  const minute = match.fixture.status.elapsed ?? 0;
  const isFinished = match.fixture.status.short === "FT";

  const home = match.teams.home;
  const away = match.teams.away;

  // eventos básicos
  const goalsHome = match.events?.home.filter((e) => e.type === "Goal") ?? [];
  const goalsAway = match.events?.away.filter((e) => e.type === "Goal") ?? [];
  const yellowsHome =
    match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Yellow")) ?? [];
  const redsHome =
    match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Red")) ?? [];
  const yellowsAway =
    match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Yellow")) ?? [];
  const redsAway =
    match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Red")) ?? [];

  // posesión
  const possHome = String(getStat(match.statistics?.home, "Ball Possession") ?? "—");
  const possAway = String(getStat(match.statistics?.away, "Ball Possession") ?? "—");

  // “Partidazo” simple: muchos goles o final ajustado
  const totalGoals = (match.goals?.home ?? 0) + (match.goals?.away ?? 0);
  const diff = Math.abs((match.goals?.home ?? 0) - (match.goals?.away ?? 0));
  const partidazo = totalGoals >= 3 || (minute >= 75 && diff <= 1);

  const canal = (match as { broadcast?: { name?: string } })?.broadcast?.name ?? "ESPN";

  return (
    <div className="bg-[#12161c] rounded-xl text-white w-full max-w-md mx-auto border border-[#2a2e39] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
      {/* Faja superior: minuto/estado a la izquierda, badge a la derecha */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0f1319]">
        <div className="flex items-baseline gap-2">
          {isLive && (
            <span className="text-[20px] leading-none font-extrabold text-[#ffd95b]">
              {minute}&apos;
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-[12px] font-semibold text-white/80 bg-[#222a35] px-2 py-[2px] rounded">
              {new Date(match.fixture.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {isFinished && (
            <span className="text-[12px] font-semibold text-white/80 bg-[#222a35] px-2 py-[2px] rounded">
              Finalizado
            </span>
          )}
        </div>
        {partidazo && (
          <div className="flex items-center gap-1 text-[12px]">
            <span className="text-white/85">Partidazo</span>
            <span>🔥</span>
          </div>
        )}
      </div>

      {/* Línea principal: escudos + marcador + escudos */}
      <div className="flex items-center justify-between px-3 py-3 bg-[#171b23] border-t border-[#2a2e39]">
        <div className="flex items-center gap-2 min-w-0 max-w-[140px]" title={home.name}>
          <Image src={home.logo} alt={home.name} width={28} height={28} className="rounded-full bg-white" />
          <span className="truncate font-semibold">{home.name}</span>
        </div>

        <div className="flex flex-col items-center min-w-[88px]">
          <div className="text-2xl font-extrabold leading-none">
            {match.goals.home} <span className="text-lg font-bold text-[#ffe066]">-</span> {match.goals.away}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0 max-w-[140px] justify-end" title={away.name}>
          <span className="truncate font-semibold text-right">{away.name}</span>
          <Image src={away.logo} alt={away.name} width={28} height={28} className="rounded-full bg-white" />
        </div>
      </div>

      {/* Banda compacta: amarillas | posesión | rojas | canal */}
      <div className="grid grid-cols-4 gap-2 px-3 py-2 items-center text-[12px] bg-[#171b23] border-t border-[#2a2e39]">
        <div className="flex items-center justify-center gap-1">
          <span className="mr-1">🟨</span>
          <span>{yellowsHome.length}</span>
          <span className="mx-2 text-white/40">|</span>
          <span>{yellowsAway.length}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-white/70">Posesión</span>
          <span className="font-semibold">{possHome}</span>
          <span className="text-white/40">/</span>
          <span className="font-semibold">{possAway}</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="mr-1">🟥</span>
          <span>{redsHome.length}</span>
          <span className="mx-2 text-white/40">|</span>
          <span>{redsAway.length}</span>
        </div>
        <div className="flex items-center justify-end text-white/70">
          <span className="text-[11px]">Canal:</span>
          <span className="ml-1 text-[11px] font-semibold">{canal}</span>
        </div>
      </div>

      {/* Goleadores */}
      {(goalsHome.length > 0 || goalsAway.length > 0) && (
        <div className="grid grid-cols-2 gap-3 px-3 pt-3 pb-1 text-xs">
          <div className="flex flex-col items-start gap-1">
            {goalsHome.map((e, i) => (
              <span key={`gh-${i}`} className="flex items-center gap-1">
                ⚽ <span className="text-white/90">{e.time.elapsed}&apos;</span> {e.player.name}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1">
            {goalsAway.map((e, i) => (
              <span key={`ga-${i}`} className="flex items-center gap-1">
                {e.player.name} <span className="text-white/90">{e.time.elapsed}&apos;</span> ⚽
              </span>
            ))}
          </div>
        </div>
      )}

      {/* VER MAS */}
      <div className="px-3 py-2 flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[12px] font-semibold text-[#51ff9c]"
        >
          {open ? "OCULTAR" : "VER MAS"}
        </button>
        {/* espacio para “Escuchá la radio en vivo” si querés sumar un botón */}
      </div>

      {/* Dropdown con tabs */}
      {open && (
        <div className="px-2 pb-3">
          {/* tabs */}
          <div className="flex text-[12px]">
            <Tab label="MAPA DE JUEGO EN VIVO" active={tab === "map"} onClick={() => setTab("map")} />
            <Tab label="FORMACIONES" active={tab === "lineup"} onClick={() => setTab("lineup")} />
            <Tab label="CRONOLOGIA E HISTORIAL" active={tab === "timeline"} onClick={() => setTab("timeline")} />
          </div>

          {/* contenido */}
          <div className="bg-[#0f1319] border border-[#2a2e39] rounded-b-xl rounded-tr-xl p-2 mt-[-1px]">
            {tab === "map" && <LiveMap minute={isLive ? minute : null} />}
            {tab === "lineup" && (
              <div className="text-xs text-white/90">
                <Lineups
                  fixtureId={match.fixture.id}
                  homeId={match.teams.home.id}
                  awayId={match.teams.away.id}
                />
              </div>
            )}
            {tab === "timeline" && (
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

/* ---------- subcomponentes UI ---------- */

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
      className={[
        "px-3 py-2 border border-[#2a2e39] bg-[#1a1f28] hover:bg-[#202634] transition-colors",
        active ? "text-white font-semibold border-b-transparent rounded-t-xl" : "text-white/60",
      ].join(" ")}
      style={{ marginRight: 2 }}
    >
      {label}
    </button>
  );
}

function LiveMap({ minute }: { minute: number | null }) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#2a2e39]">
      <div
        className="w-full h-[180px] md:h-[220px] bg-[#16331e] relative"
        style={{
          backgroundImage:
            "linear-gradient(#1c3b24 2px, transparent 2px), linear-gradient(90deg, #1c3b24 2px, transparent 2px)",
          backgroundSize: "100% 33.33%, 25% 100%",
          backgroundPosition: "0 0, 0 0",
        }}
      >
        <div className="absolute left-3 top-3 text-[11px] bg-[#2a2e39] text-white/80 px-2 py-[2px] rounded">
          {minute != null ? `${String(minute).padStart(2, "0")}:00` : "—:—"}
        </div>
        {/* marcador demo */}
        <div className="absolute left-3 bottom-6 text-[11px] px-2 py-1 rounded bg-[#0e1a13] border border-[#274e34]">
          CSM Resita <span className="text-[#66e192] font-semibold]">Saque de arco</span>
        </div>
        {/* cono de “heat” demo */}
        <div className="absolute left-[26px] bottom-[44px] w-0 h-0"
             style={{ borderLeft: "10px solid transparent", borderRight: "120px solid transparent", borderTop: "80px solid rgba(0,0,0,0.25)" }} />
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
  const sorted = useMemo(
    () => [...events].sort((a, b) => ((a as { time?: { elapsed?: number } })?.time?.elapsed ?? 0) - ((b as { time?: { elapsed?: number } })?.time?.elapsed ?? 0)),
    [events]
  );
  if (!sorted.length) {
    return <div className="text-center text-white/50 text-xs">Sin eventos disponibles.</div>;
  }
  return (
    <div className="text-xs text-white/75 space-y-2">
      {sorted.map((e, i) => {
        const event = e as { time?: { elapsed?: number }; type?: string; detail?: string; player?: { name?: string }; assist?: { name?: string } };
        const translatedType = translateEventType(event?.type);
        const translatedDetail = translateEventDetail(event?.detail);
        
        return (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-white/60">{event?.time?.elapsed ?? "—"}&apos;</span>
            <span className="mx-2 text-white/80">
              {translatedType}{translatedDetail ? ` • ${translatedDetail}` : ""}
            </span>
            <span className="truncate max-w-[55%] text-right">
              {event?.player?.name ?? event?.assist?.name ?? "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
