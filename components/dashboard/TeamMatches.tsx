"use client";

import Image from "next/image";
import { useState } from "react";
import { Match, StatisticsKeys } from "@/types/match";
import { STATISTICS_LABELS } from "@/types/match";

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
  const [openMatchId, setOpenMatchId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
    setOpenMatchId((prev) => (prev === id ? null : id)); 
  };

  return (
    <div className=" w-full text-white font-sans py-6 px-3 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-400">
          Liga Profesional de Fútbol
        </h2>
        <Image
          src="https://media.api-sports.io/football/leagues/128.png"
          alt="Liga Profesional Argentina"
          width={30}
          height={30}
        />
      </div>

      <div className="space-y-2">
        {matches.map((match) => {
          const isOpen = openMatchId === match.fixture.id;
          const statusShort = match.fixture.status.short;
          const elapsed = match.fixture.status?.elapsed;

          return (
            <div key={match.fixture.id}>
              {/* Match summary */}
              <div
                className="bg-[#1a1a1a] rounded-lg px-4 py-3 border border-gray-700 cursor-pointer"
                onClick={() => toggleDropdown(match.fixture.id)}
              >
                {["1H", "2H", "LIVE"].includes(statusShort) && elapsed && (
                  <div className="text-center text-yellow-400 font-bold text-lg mb-1">
                    ⏱ {elapsed}′
                  </div>
                )}

                <div className="flex justify-between items-center">
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
                    <p className="font-semibold text-lg">
                      {match.goals.home ?? "-"} - {match.goals.away ?? "-"}
                    </p>
                    <p className="text-xs text-yellow-400">
                      {getMatchStatus(statusShort)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-[35%]">
                    <span className="text-sm truncate text-right">
                      {match.teams.away.name}
                    </span>
                    <Image
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      width={24}
                      height={24}
                    />
                    <span className="ml-1 text-yellow-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {/* Match details */}
              {isOpen && (
                <div className="bg-[#222] border border-gray-700 rounded-b-lg px-4 py-3 text-sm animate-fade-in space-y-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>📅 {new Date(match.fixture.date).toLocaleString()}</span>
                    <span>Estado: {match.fixture.status.long}</span>
                  </div>

                  {/* Statistics Table */}
                  {match.statistics ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs text-center border-separate border-spacing-x-2">
                        <thead>
                          <tr className="text-white/80">
                            <th className="text-left">Estadística</th>
                            <th>{match.teams.home.name}</th>
                            <th>{match.teams.away.name}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(StatisticsKeys).map((statKey) => {
                            const label = STATISTICS_LABELS[statKey];

                            const homeStat = match.statistics!.home.find((s) => s.type === statKey);
                            const awayStat = match.statistics!.away.find((s) => s.type === statKey);

                            const homeValue = homeStat?.value ?? "-";
                            const awayValue = awayStat?.value ?? "-";

                            const homeGreen = Number(homeValue) > Number(awayValue);
                            const awayGreen = Number(awayValue) > Number(homeValue);

                            return (
                              <tr key={statKey}>
                                <td className="text-left text-gray-300">{label}</td>
                                <td className={homeGreen ? "text-green-400" : ""}>
                                  {homeValue}
                                </td>
                                <td className={awayGreen ? "text-green-400" : ""}>
                                  {awayValue}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-400">No hay estadísticas disponibles.</div>
                  )}

                  {/* Botón de radio en vivo (ficticio por ahora) */}
                  <div>
                    <a
                      href="https://example.com/radio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-white text-black font-semibold text-sm px-4 py-2 rounded hover:bg-gray-200 transition"
                    >
                      🎧 ESCUCHÁ LA RED EN VIVO
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
