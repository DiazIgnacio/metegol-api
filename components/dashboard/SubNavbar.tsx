"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FootballApi } from "@/lib/footballApi";
import type { League } from "@/types/match";

interface SubNavbarProps {
  selectedLeague?: number | null;
  onLeagueChange: (leagueId: number | null) => void;
}

// Static leagues with local logos for immediate display
const staticLeagues: League[] = [
  { id: 128, name: "Liga Profesional", logo: "/leagues/lpf.png", country: "Argentina" },
  { id: 129, name: "Primera Nacional", logo: "/leagues/nacional.png", country: "Argentina" },
  { id: 130, name: "Copa Argentina", logo: "/leagues/copa-arg.png", country: "Argentina" },
  { id: 2, name: "Champions League", logo: "/leagues/ucl.png", country: "Europe" },
  { id: 3, name: "Europa League", logo: "/leagues/uel.png", country: "Europe" },
  { id: 848, name: "Conference League", logo: "/leagues/uecl.png", country: "Europe" },
  { id: 15, name: "Mundial Clubes", logo: "/leagues/cwc.png", country: "World" },
];

export default function SubNavbar({ selectedLeague = null, onLeagueChange }: SubNavbarProps) {
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const fetchedLeagues = await FootballApi.getLeagues();
        // Merge static leagues with fetched ones, prioritizing static for display
        const mergedLeagues = staticLeagues.map(staticLeague => {
          const fetchedLeague = fetchedLeagues.find(fl => fl.id === staticLeague.id);
          return {
            ...staticLeague,
            ...fetchedLeague,
            logo: staticLeague.logo, // Always use local logo
          };
        });
        setLeagues(mergedLeagues);
      } catch (error) {
        console.error("Error fetching leagues:", error);
        // Fallback to static leagues if API fails
        setLeagues(staticLeagues);
      }
    };

    fetchLeagues();
  }, []);

  return (
    <div className="bg-[#0c0c0c] py-2 px-2 rounded-2xl shadow-inner overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="flex items-center gap-4">
        {/* Todas las ligas option */}
        <button
          title="Todas las ligas"
          onClick={() => onLeagueChange(null)}
          className={`flex-shrink-0 focus:outline-none hover:scale-105 transition-transform px-3 py-1 rounded-lg text-sm font-medium ${
            selectedLeague === null ? "bg-lime-500 text-black" : "bg-[#333] text-white"
          }`}
        >
          Todas
        </button>

        {leagues.map((league) => (
          <button
            key={league.id}
            title={league.name}
            onClick={() => onLeagueChange(league.id)}
            className={`flex-shrink-0 focus:outline-none hover:scale-105 transition-transform ${
              selectedLeague === league.id ? "ring-2 ring-lime-500 rounded-lg" : ""
            }`}
          >
            <Image
              src={league.logo}
              alt={league.name}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </button>
        ))}

        {/* Flecha final */}
        <div className="flex-shrink-0 w-8 h-8 bg-[#333] rounded-full flex items-center justify-center ml-2">
          <span className="text-white text-lg">{">"}</span>
        </div>
      </div>
    </div>
  );
}
