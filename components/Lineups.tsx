import React from "react";
import Image from "next/image";
import { useLineups } from "@/hooks/useLineups";
import { LineupTeam } from "@/types/match";

interface LineupsProps {
  fixtureId: number;
  homeId: number;
  awayId: number;
}

export const Lineups: React.FC<LineupsProps> = ({
  fixtureId,
  homeId,
  awayId,
}) => {
  const { lineups, loading } = useLineups(fixtureId, homeId, awayId);

  if (loading)
    return (
      <div className="py-4 text-center text-white/60">
        Cargando formaciones...
      </div>
    );
  if (!lineups || lineups.length === 0)
    return (
      <div className="py-4 text-center text-white/60">
        No hay formaciones disponibles.
      </div>
    );

  const homeTeam = lineups[0];
  const awayTeam = lineups[1];

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-[#333] bg-[#232323] p-4">
      {/* Team Headers with Coach Info */}
      <div className="flex w-full items-center justify-between">
        <TeamHeader team={homeTeam} align="left" />
        <span className="text-xs font-bold text-white/50">FORMACIONES</span>
        <TeamHeader team={awayTeam} align="right" />
      </div>

      {/* Starting XI */}
      <div className="flex w-full gap-4">
        <div className="flex-1">
          <div className="mb-2 text-center">
            <span className="text-xs font-semibold text-white/60">
              TITULARES
            </span>
          </div>
          <XIList
            players={homeTeam?.startXI}
            colors={homeTeam?.team.colors}
            align="left"
          />
        </div>
        <div className="flex-1">
          <div className="mb-2 text-center">
            <span className="text-xs font-semibold text-white/60">
              TITULARES
            </span>
          </div>
          <XIList
            players={awayTeam?.startXI}
            colors={awayTeam?.team.colors}
            align="right"
          />
        </div>
      </div>

      {/* Substitutes */}
      <div className="flex w-full gap-4">
        <div className="flex-1">
          <div className="mb-2 text-center">
            <span className="text-xs font-semibold text-white/60">
              SUPLENTES
            </span>
          </div>
          <SubsList
            players={homeTeam?.substitutes}
            colors={homeTeam?.team.colors}
            align="left"
          />
        </div>
        <div className="flex-1">
          <div className="mb-2 text-center">
            <span className="text-xs font-semibold text-white/60">
              SUPLENTES
            </span>
          </div>
          <SubsList
            players={awayTeam?.substitutes}
            colors={awayTeam?.team.colors}
            align="right"
          />
        </div>
      </div>
    </div>
  );
};

const TeamHeader = ({
  team,
  align,
}: {
  team?: LineupTeam;
  align: "left" | "right";
}) => (
  <div
    className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`}
    style={{ minWidth: 0 }}
  >
    <div className="flex items-center gap-2">
      {team?.team.logo && (
        <Image
          src={team.team.logo}
          alt={team.team.name || ""}
          width={28}
          height={28}
          className="rounded-full bg-white"
        />
      )}
      <div className="flex min-w-0 flex-col">
        <span
          className="truncate text-sm font-semibold text-white"
          title={team?.team.name}
        >
          {team?.team.name}
        </span>
        <span className="text-xs text-white/50">{team?.formation}</span>
      </div>
    </div>

    {/* Coach Info */}
    {team?.coach && (
      <div
        className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <Image
          src={team.coach.photo}
          alt={team.coach.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-xs text-white/70">DT</span>
          <span
            className="max-w-20 truncate text-xs text-white/50"
            title={team.coach.name}
          >
            {team.coach.name}
          </span>
        </div>
      </div>
    )}
  </div>
);

const XIList = ({
  players,
  colors,
  align,
}: {
  players?: {
    player: { id: number; name: string; number: number; pos: string };
  }[];
  colors?: LineupTeam["team"]["colors"];
  align: "left" | "right";
}) => (
  <ul
    className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}
  >
    {players?.map(p => (
      <li
        key={p.player.id}
        className={`flex items-center gap-2 text-xs ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold"
          style={{
            backgroundColor:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.primary}`
                : `#${colors?.player.primary}`,
            color:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.number}`
                : `#${colors?.player.number}`,
            borderColor:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.border}`
                : `#${colors?.player.border}`,
          }}
        >
          {p.player.number}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-white">
            {p.player.name}
          </span>
          <span className="text-xs text-white/40">{p.player.pos}</span>
        </div>
      </li>
    ))}
  </ul>
);

const SubsList = ({
  players,
  colors,
  align,
}: {
  players?: {
    player: {
      id: number;
      name: string;
      number: number | null;
      pos: string | null;
    };
  }[];
  colors?: LineupTeam["team"]["colors"];
  align: "left" | "right";
}) => (
  <ul
    className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}
  >
    {players?.map(p => (
      <li
        key={p.player.id}
        className={`flex items-center gap-2 text-xs ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold opacity-70"
          style={{
            backgroundColor:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.primary}`
                : `#${colors?.player.primary}`,
            color:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.number}`
                : `#${colors?.player.number}`,
            borderColor:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.border}`
                : `#${colors?.player.border}`,
          }}
        >
          {p.player.number}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-white/70">{p.player.name}</span>
          <span className="text-xs text-white/40">{p.player.pos}</span>
        </div>
      </li>
    ))}
  </ul>
);
