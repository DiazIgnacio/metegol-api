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

export default function LeagueSection({
  leagueName,
  leagueLogo,
  leagueCountry,
  matches,
}: Props) {
  const liveMatches = matches.filter(m =>
    ["1H", "2H", "LIVE", "ET", "P"].includes(m.fixture.status.short)
  );
  const hasLiveMatches = liveMatches.length > 0;

  const isArgentineLeague =
    leagueName === "Liga Profesional de Futbol" ||
    leagueName?.includes("Liga Profesional");

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2e39] bg-[#181c23]">
      {/* League Header */}
      <div
        className={`relative px-4 py-3 ${!isArgentineLeague ? "bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e3a8a]" : ""}`}
      >
        {isArgentineLeague && (
          <Image
            src={Argentina}
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
                className="rounded-full bg-white"
              />
            )}
            <div className="flex flex-col">
              <h3 className="truncate text-sm font-bold text-white">
                {leagueName}
              </h3>
              {leagueCountry && (
                <span className="text-xs text-white/70">{leagueCountry}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/70">
                {matches.length} partido{matches.length !== 1 ? "s" : ""}
              </span>
              {hasLiveMatches && (
                <span className="rounded-full bg-[#00ff7f] px-2 py-1 font-bold text-black">
                  {liveMatches.length} EN VIVO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Matches List */}
      <div className="space-y-1">
        {matches.map(match => (
          <SimpleMatchCard key={match.fixture.id} match={match} />
        ))}
      </div>
    </div>
  );
}
