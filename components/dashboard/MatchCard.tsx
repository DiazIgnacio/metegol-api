import Image from "next/image";
import type { Match } from "@/types/match";

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg px-4 py-3 border border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{match.fixture.date.slice(11, 16)}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        {/* Home */}
        <div className="flex items-center gap-2 w-[40%]">
          <Image
            src={match.teams.home.logo}
            alt={match.teams.home.name}
            width={24}
            height={24}
          />
          <span className="text-sm">{match.teams.home.name}</span>
        </div>

        {/* VS / Result */}
        <div className="text-center text-sm font-semibold w-[20%]">
          {match.goals.home} - {match.goals.away}
        </div>

        {/* Away */}
        <div className="flex items-center justify-end gap-2 w-[40%]">
          <span className="text-sm text-right">{match.teams.away.name}</span>
          <Image
            src={match.teams.away.logo}
            alt={match.teams.away.name}
            width={24}
            height={24}
          />
        </div>
      </div>
    </div>
  );
}
