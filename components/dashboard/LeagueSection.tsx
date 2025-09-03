"use client";

import Image from "next/image";
import SimpleMatchCard from "./SimpleMatchCard";
import type { Match } from "@/types/match";
import Argentina from "@/public/Argentina.png";

interface Props {
  leagueName: string;
  leagueLogo?: string;
  leagueCountry?: string;
  matches: Match[];
}

export default function LeagueSection({ leagueName, leagueLogo, leagueCountry, matches }: Props) {
  const liveMatches = matches.filter(m => ["1H", "2H", "LIVE", "ET", "P"].includes(m.fixture.status.short));
  const hasLiveMatches = liveMatches.length > 0;
  
  const isArgentineLeague = leagueName === "Liga Profesional de Futbol" || leagueName?.includes("Liga Profesional");

  return (
    <div className="bg-[#181c23] rounded-xl border border-[#2a2e39] overflow-hidden">
      {/* League Header */}
      <div className={`relative px-4 py-3 ${!isArgentineLeague ? "bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e3a8a]" : ""}`}>
        {isArgentineLeague && (
          <Image
            src= {Argentina}
            alt="Argentina"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {leagueLogo && (
              <Image 
                src={leagueLogo} 
                width={24} 
                height={24} 
                alt={leagueName}
                className="bg-white rounded-full"
              />
            )}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white truncate">
                {leagueName}
              </h3>
              {leagueCountry && (
                <span className="text-xs text-white/70">
                  {leagueCountry}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/70">
                {matches.length} partido{matches.length !== 1 ? 's' : ''}
              </span>
              {hasLiveMatches && (
                <span className="bg-[#00ff7f] text-black px-2 py-1 rounded-full font-bold">
                  {liveMatches.length} EN VIVO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Matches List */}
      <div className="space-y-1">
        {matches.map((match) => (
          <SimpleMatchCard key={match.fixture.id} match={match} />
        ))}
      </div>
    </div>
  );
}