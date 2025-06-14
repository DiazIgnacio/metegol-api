"use client";

import Image from "next/image";
import { useState } from "react";
import type { Match } from "@/types/match";
import { STATISTICS_LABELS, StatisticsKeys } from "@/types/match";

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
  console.log(matches.find((match) => match.fixture.id === openMatchId)?.statistics);

  const toggleDropdown = (id: number) => {
    setOpenMatchId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#111] text-white font-sans py-6 px-3">
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
          return (
            <div key={match.fixture.id}>
              <div
                className="bg-[#1a1a1a] rounded-lg px-4 py-3 flex justify-between items-center border border-gray-700 cursor-pointer"
                onClick={() => toggleDropdown(match.fixture.id)}
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
                  <span className="text-sm truncate text-right">
                    {match.teams.away.name}
                  </span>
                  <Image
                    src={match.teams.away.logo}
                    alt={match.teams.away.name}
                    width={24}
                    height={24}
                  />
                  <button
                    className="ml-2 text-xs text-yellow-400 bg-transparent border-none focus:outline-none"
                    aria-label={isOpen ? "Cerrar detalles" : "Ver detalles"}
                  >
                    {isOpen ? "▲" : "▼"}
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="bg-[#222] border border-gray-700 rounded-b-lg px-4 py-2 text-sm animate-fade-in">
                  <div className="flex justify-between mb-2">
                    <span>Fecha: {new Date(match.fixture.date).toLocaleString()}</span>
                    <span>Estado: {match.fixture.status.long}</span>
                  </div>
                  {match.statistics ? (
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full text-xs text-center border-separate border-spacing-x-2">
                        <thead>
                          <tr>
                            <th className="text-left">Estadística</th>
                            <th>{match.teams.home.name}</th>
                            <th>{match.teams.away.name}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(StatisticsKeys).map((statLabel) => {
                            const homeStat = match.statistics!.home.find((stat) => stat.type === statLabel);
                            const awayStat = match.statistics!.away.find((stat) => stat.type === statLabel);
                            const homeValue = homeStat ? homeStat.value : "-";
                            const awayValue = awayStat ? awayStat.value : "-";
                            const label = STATISTICS_LABELS[statLabel];
                            return (
                              <tr key={statLabel}>
                                <td className="text-left text-gray-300">{label}</td>
                                <td>{homeValue ?? "-"}</td>
                                <td>{awayValue ?? "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-400 mt-2">
                      No hay estadísticas disponibles.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
