"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Match } from "@/types/match";
import { StatisticsKeys, EventsKeys } from "@/types/match";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // ==========================
  // 1) Formateo de fecha
  // ==========================
  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "dd MMM yyyy - HH:mm", { locale: es });

  // ==========================
  // 2) Estadísticas de posesión (si vienen)
  // ==========================
  const homePossession =
    match.statistics?.home.find((s) => s.type === StatisticsKeys.BALL_POSSESSION)
      ?.value || 0;
  const awayPossession =
    match.statistics?.away.find((s) => s.type === StatisticsKeys.BALL_POSSESSION)
      ?.value || 0;

  // ==========================
  // 3) Conteo de tarjetas desde los eventos
  // ==========================
  const yellowHome =
    match.events?.home.reduce(
      (acc, e) =>
        acc + (e.type === EventsKeys.CARD && /yellow/i.test(e.detail) ? 1 : 0),
      0
    ) ?? 0;
  const redHome =
    match.events?.home.reduce(
      (acc, e) =>
        acc + (e.type === EventsKeys.CARD && /red/i.test(e.detail) ? 1 : 0),
      0
    ) ?? 0;
  const yellowAway =
    match.events?.away.reduce(
      (acc, e) =>
        acc + (e.type === EventsKeys.CARD && /yellow/i.test(e.detail) ? 1 : 0),
      0
    ) ?? 0;
  const redAway =
    match.events?.away.reduce(
      (acc, e) =>
        acc + (e.type === EventsKeys.CARD && /red/i.test(e.detail) ? 1 : 0),
      0
    ) ?? 0;

  // ==========================
  // 4) Lista de eventos filtrada y ordenada
  // ==========================
  const events = [
    ...(match.events?.home || []),
    ...(match.events?.away || []),
  ]
    .filter((e) => e.type === EventsKeys.GOAL || e.type === EventsKeys.CARD)
    .sort(
      (a, b) =>
        a.time.elapsed * 100 +
        (a.time.extra || 0) -
        (b.time.elapsed * 100 + (b.time.extra || 0))
    );

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-gray-700 overflow-hidden">
      {/* ===== 5) HEADER PRINCIPAL ===== */}
      <div
        className="px-4 py-3 cursor-pointer hover:bg-[#252525] transition-colors"
        onClick={() => setIsExpanded((p) => !p)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">
            {formatDate(match.fixture.date)}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        <div className="flex w-full items-center justify-center mt-2">
          {/* Local */}
          <div className="flex items-center gap-2 flex-1 justify-end"> 
            <span className="text-sm">{match.teams.home.name}</span>
            <Image
              src={match.teams.home.logo}
              width={24}
              height={24}
              alt={match.teams.home.name}
            />
          </div>
          {/* Marcador */}
          <div className="text-xl font-semibold mx-2">
            {match.goals.home} - {match.goals.away}
          </div>
          {/* Visitante */}
          <div className="flex items-center gap-2 flex-1 justify-start">
            <Image
              src={match.teams.away.logo}
              width={24}
              height={24}
              alt={match.teams.away.name}
            />
            <span className="text-sm">{match.teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* ===== 6) RESUMEN TARJETAS & POSESIÓN ===== */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-white">
        {/* Local: amarilla, roja */}
        <div className="flex items-center gap-1">
          <span>🟨</span>
          <span>{yellowHome}</span>
          <span className="ml-2">🟥</span>
          <span>{redHome}</span>
        </div>
        {/* Posesión */}
        <div>{homePossession}</div>
        <div>{awayPossession}</div>
        {/* Visitante: roja, amarilla */}
        <div className="flex items-center gap-1">
          <span>🟥</span>
          <span>{redAway}</span>
          <span className="ml-2">🟨</span>
          <span>{yellowAway}</span>
        </div>
      </div>

      {/* ===== 7) EVENTOS DETALLADOS ===== */}
      {isExpanded && events.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-white/80 mb-2">
            Eventos
          </h3>
          <ul className="space-y-1 text-xs text-white">
            {events.map((evt, i) => {
              // minuto formateado
              const minute = evt.time.extra
                ? `${evt.time.elapsed}+${evt.time.extra}'`
                : `${evt.time.elapsed}'`;
              // icono
              const icon =
                evt.type === EventsKeys.GOAL
                  ? "⚽️"
                  : /yellow/i.test(evt.detail)
                  ? "🟨"
                  : "🟥";

              return (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-white/70">{minute}</span>
                  <span>{icon}</span>
                  <span>{evt.player.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
