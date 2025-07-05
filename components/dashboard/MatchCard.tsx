"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Match } from "@/types/match";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { STATISTICS_LABELS } from "@/types/match";

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy - HH:mm", { locale: es });
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "Match Finished": "Finalizado",
      "Not Started": "No iniciado",
      "First Half": "Primer tiempo",
      "Second Half": "Segundo tiempo",
      "Halftime": "Entretiempo",
      "Live": "En vivo",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-gray-700 shadow-sm overflow-hidden">
      {/* Header desplegable */}
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-[#252525] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">{formatDate(match.fixture.date)}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {/* Información del partido */}
          <div className="mt-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white/80">Estado:</span>
              <span className="text-sm text-lime-400">{getStatusText(match.fixture.status.long)}</span>
            </div>
            {match.fixture.status.elapsed && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white/80">Tiempo:</span>
                <span className="text-sm text-white/70">{match.fixture.status.elapsed}&apos;</span>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          {match.statistics && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-white/90 mb-3">Estadísticas</h4>
              <div className="space-y-2">
                {match.statistics.home.map((stat, index) => {
                  const awayStat = match.statistics?.away[index];
                  const label = STATISTICS_LABELS[stat.type] || stat.type;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 w-[30%]">
                        <span className="text-xs text-white/60">{stat.value || 0}</span>
                      </div>
                      <div className="text-center w-[40%]">
                        <span className="text-xs text-white/70">{label}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 w-[30%]">
                        <span className="text-xs text-white/60">{awayStat?.value || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-xs text-white/50">
              ID del partido: {match.fixture.id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
