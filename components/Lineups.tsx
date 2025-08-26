
import React from "react";
import Image from "next/image";
import { useLineups } from "@/hooks/useLineups";

interface LineupsProps {
  fixtureId: number;
  homeId: number;
  awayId: number;
}

export const Lineups: React.FC<LineupsProps> = ({ fixtureId, homeId, awayId }) => {
  const { lineups, loading } = useLineups(fixtureId, homeId, awayId);

  if (loading) return <div className="text-center text-white/60 py-4">Cargando formaciones...</div>;
  if (!lineups.home && !lineups.away) return <div className="text-center text-white/60 py-4">No hay formaciones disponibles.</div>;

  return (
    <div className="w-full bg-[#232323] rounded-lg p-2 flex flex-col gap-2 border border-[#333]">
      <div className="flex items-center justify-between w-full mb-2">
        <TeamHeader team={lineups.home?.team} formation={lineups.home?.formation} align="left" />
        <span className="text-xs text-white/50 font-bold">Formación</span>
        <TeamHeader team={lineups.away?.team} formation={lineups.away?.formation} align="right" />
      </div>
      <div className="flex w-full">
        <div className="flex-1">
          <XIList players={lineups.home?.startXI} align="left" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-xs text-white/40">Titulares</span>
        </div>
        <div className="flex-1">
          <XIList players={lineups.away?.startXI} align="right" />
        </div>
      </div>
      <div className="flex w-full mt-2">
        <div className="flex-1">
          <SubsList players={lineups.home?.substitutes} align="left" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-xs text-white/40">Suplentes</span>
        </div>
        <div className="flex-1">
          <SubsList players={lineups.away?.substitutes} align="right" />
        </div>
      </div>
    </div>
  );
};

const TeamHeader = ({ team, formation, align }: { team?: { name?: string; logo?: string }; formation?: string; align: "left" | "right" }) => (
  <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`} style={{ minWidth: 0 }}>
    {team?.logo && <Image src={team.logo} alt={team.name || ""} width={24} height={24} className="rounded-full bg-white" />}
    <div className="flex flex-col min-w-0">
      <span className="truncate font-semibold text-white text-xs" title={team?.name}>{team?.name}</span>
      <span className="text-[10px] text-white/50">{formation}</span>
    </div>
  </div>
);

const XIList = ({ players, align }: { players?: { player: { id: number; name: string; number: number } }[]; align: "left" | "right" }) => (
  <ul className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
    {players?.map((p) => (
      <li key={p.player.id} className="text-xs text-white truncate">
        <span className="font-bold text-white/80">#{p.player.number}</span> {p.player.name}
      </li>
    ))}
  </ul>
);

const SubsList = ({ players, align }: { players?: { player: { id: number; name: string; number: number } }[]; align: "left" | "right" }) => (
  <ul className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
    {players?.map((p) => (
      <li key={p.player.id} className="text-xs text-white/60 truncate">
        <span className="font-bold text-white/40">#{p.player.number}</span> {p.player.name}
      </li>
    ))}
  </ul>
);
