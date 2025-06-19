// app/components/dashboard/MainDashboard.tsx (sin "use client")
import HeaderBar from "@/components/dashboard/HeaderBar";
import DateSelector from "@/components/dashboard/DateSelector";
import TeamMatches from "@/components/dashboard/TeamMatches";
import MatchCard from "@/components/dashboard/MatchCard";
import { Match } from "@/types/match";
import SubNavbar from "./SubNavbar";

interface Props {
  matches: Match[];
}

export default function MainDashboard({ matches }: Props) {
  const groupedByLeague = {
    "Liga Profesional de Futbol": matches.slice(0, 6),
  };

  return (
    <div className="w-full text-white">
      <HeaderBar/>
      <DateSelector/>
      <div className="space-y-4 px-2 mt-4">
        {Object.entries(groupedByLeague).map(([leagueName, leagueMatches]) => (
          <div key={leagueName}>
            <h3 className="text-md font-bold text-white/80 px-1 mb-1">{leagueName}</h3>
            {leagueName === "Liga Profesional de Futbol" ? (
              <TeamMatches matches={leagueMatches} />
            ) : (
              <div className="space-y-2">
                {leagueMatches.map((match) => (
                  <MatchCard key={match.fixture.id} match={match} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
