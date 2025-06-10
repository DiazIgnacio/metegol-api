"use client";

import Image from "next/image";
import type { Match } from "@/types/match";

interface TeamMatchesProps {
  matches: Match[];
}

function getMatchStatus(short: string) {
  switch (short) {
    case "FT":
      return "Finalizado";
    case "NS":
      return "Próximamente";
    case "TBD":
      return "A confirmar";
    case "1H":
    case "2H":
    case "LIVE":
      return "En vivo";
    default:
      return short;
  }
}


export default function TeamMatches({ matches }: TeamMatchesProps) {

    console.log("Matches received:", matches);
  return (
    <div className="bg-[#111] text-white font-sans py-6 px-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-400">Liga Profesional de Fútbol</h2>
        <Image
          src="https://media.api-sports.io/football/leagues/128.png"
          alt="Liga Profesional Argentina"
          width={30}
          height={30}
        />
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <div
            key={match.fixture.id}
            className="bg-[#1a1a1a] rounded-lg px-4 py-3 flex justify-between items-center border border-gray-700"
          >
            <div className="flex items-center gap-2 w-[35%]">
              <Image
                src={match.teams.home.logo}
                alt={match.teams.home.name}
                width={24}
                height={24}
              />
              <span className="text-sm truncate">{match.teams.home.name}</span>
            </div>

            <div className="text-center w-[30%]">
              <p className="font-semibold">
                {match.goals.home ?? "-"} - {match.goals.away ?? "-"}
              </p>
              <p className="text-xs text-yellow-400">
                {getMatchStatus(match.fixture.status.short)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 w-[35%]">
              <span className="text-sm truncate text-right">{match.teams.away.name}</span>
              <Image
                src={match.teams.away.logo}
                alt={match.teams.away.name}
                width={24}
                height={24}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
