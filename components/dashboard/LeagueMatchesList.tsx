import React, { useState } from "react";
import Image from "next/image";
import MatchCard from "./MatchCard";
import type { Match } from "../../types/match";

interface LeagueMatchesListProps {
  leagueName: string;
  leagueLogo: string;
  matches: Match[];
}

export default function LeagueMatchesList({ leagueName, leagueLogo, matches }: LeagueMatchesListProps) {
  const [openMatchId, setOpenMatchId] = useState<number | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#181c23] rounded-xl shadow-lg border border-[#2a2e39] mb-8 overflow-hidden">
      {/* League Header */}
      <div className="bg-[#0e1a13] px-4 py-3 border-b border-[#2a2e39]">
        <div className="flex items-center gap-3">
          <Image src={leagueLogo} alt={leagueName} width={32} height={32} className="rounded" />
          <h2 className="text-white font-bold text-lg">{leagueName}</h2>
        </div>
      </div>
      <div className="divide-y divide-[#232323]">
        {matches.map((match) => {
          const isOpen = openMatchId === match.fixture.id;
          const home = match.teams.home;
          const away = match.teams.away;
          const isLive = ["1H", "2H", "LIVE"].includes(match.fixture.status.short);
          const isUpcoming = match.fixture.status.short === "NS";
          const formatMinute = () => {
            return isLive
              ? `${match.fixture.status.elapsed}'`
              : isUpcoming
              ? match.fixture.date.slice(11, 16)
              : "";
          };
          // Stats
          const yellowHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
          const redHome = match.events?.home.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;
          const yellowAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Yellow")).length || 0;
          const redAway = match.events?.away.filter((e) => e.type === "Card" && e.detail.includes("Red")).length || 0;
          const homePoss = match.statistics?.home.find((s) => s.type === "Ball Possession")?.value || "-";
          const awayPoss = match.statistics?.away.find((s) => s.type === "Ball Possession")?.value || "-";
          // Canal y destacado (mock)
          const canal = "ESPN Premium";
          const partidazo = false; // Puedes poner lógica para destacar

          return (
            <div key={match.fixture.id} className="bg-[#232323] hover:bg-[#232b3a] transition-colors cursor-pointer">
              <div
                className="flex items-center px-4 py-2 gap-2"
                onClick={() => setOpenMatchId(isOpen ? null : match.fixture.id)}
              >
                <span className={`text-lg font-bold ${isLive ? "text-[#baff6b]" : "text-[#ffe066]"} w-14 text-center`}>{formatMinute()}</span>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="truncate font-semibold text-white text-base">{home.name}</span>
                  <Image src={home.logo} alt={home.name} width={24} height={24} className="bg-white rounded-full" />
                  <span className="font-bold text-white text-xl">{isUpcoming ? "-" : match.goals.home}</span>
                  <span className="font-bold text-white text-xl">-</span>
                  <span className="font-bold text-white text-xl">{isUpcoming ? "-" : match.goals.away}</span>
                  <Image src={away.logo} alt={away.name} width={24} height={24} className="bg-white rounded-full" />
                  <span className="truncate font-semibold text-white text-base">{away.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {/* Tarjetas equipo local */}
                  <span className="text-[#ffe066] text-lg">🟨 {yellowHome}</span>
                  <span className="text-[#ff5252] text-lg">🟥 {redHome}</span>
                  <span className="text-white/40 mx-1">|</span>
                  
                  {/* Posesión */}
                  <span className="text-white text-base font-bold">{homePoss}</span>
                  <span className="text-xs text-white/60">Posesión</span>
                  <span className="text-white text-base font-bold">{awayPoss}</span>
                  <span className="text-white/40 mx-1">|</span>
                  
                  {/* Tarjetas equipo visitante */}
                  <span className="text-[#ffe066] text-lg">🟨 {yellowAway}</span>
                  <span className="text-[#ff5252] text-lg">🟥 {redAway}</span>
                  
                  <span className="text-xs text-white/80 ml-2">Canal: {canal}</span>
                  {partidazo && <span className="ml-2 text-orange-400 font-bold flex items-center">🔥 Partidazo</span>}
                </div>
              </div>
              {isOpen && (
                <div className="bg-[#181c23] border-t border-[#2a2e39]">
                  <MatchCard match={match} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
