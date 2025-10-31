import React from "react";
import Image from "next/image";
import { LineupTeam } from "@/types/match";

interface LineupsProps {
  lineups?: {
    home: LineupTeam;
    away: LineupTeam;
  };
}

export const Lineups: React.FC<LineupsProps> = ({ lineups }) => {
  if (!lineups)
    return (
      <div className="py-4 text-center text-white/60">
        No hay formaciones disponibles.
      </div>
    );

  const homeTeam = lineups.home;
  const awayTeam = lineups.away;

  return (
    <div className="w-full">
      {/* Main Container with Single Scroll */}
      <div className="rounded-lg border border-[#333] bg-[#232323] p-4">
        {/* Team Headers */}
        <div className="mb-4 flex w-full items-center justify-between">
          <TeamHeader team={homeTeam} align="left" />
          <span className="text-xs font-bold text-white/50">FORMACIONES</span>
          <TeamHeader team={awayTeam} align="right" />
        </div>

        {/* Single Scrollable Container */}
        <div className="max-h-80 overflow-y-auto rounded border border-[#444] bg-[#1a1a1a] p-2">
          {/* Starting XI Section */}
          <div className="mb-4">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold text-white">TITULARES</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Home Team Starting XI */}
              <div>
                <div className="mb-2 text-center">
                  <span className="text-xs font-semibold text-blue-400">
                    {homeTeam?.team.name} ({homeTeam?.formation})
                  </span>
                </div>
                <SimplePlayerList
                  players={homeTeam?.startXI}
                  colors={homeTeam?.team.colors}
                />
              </div>

              {/* Away Team Starting XI */}
              <div>
                <div className="mb-2 text-center">
                  <span className="text-xs font-semibold text-red-400">
                    {awayTeam?.team.name} ({awayTeam?.formation})
                  </span>
                </div>
                <SimplePlayerList
                  players={awayTeam?.startXI}
                  colors={awayTeam?.team.colors}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-white/20"></div>

          {/* Substitutes Section */}
          <div>
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold text-white">SUPLENTES</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Home Team Substitutes */}
              <div>
                <div className="mb-2 text-center">
                  <span className="text-xs font-semibold text-blue-400">
                    {homeTeam?.team.name}
                  </span>
                </div>
                <SimplePlayerList
                  players={homeTeam?.substitutes}
                  colors={homeTeam?.team.colors}
                  isSub={true}
                />
              </div>

              {/* Away Team Substitutes */}
              <div>
                <div className="mb-2 text-center">
                  <span className="text-xs font-semibold text-red-400">
                    {awayTeam?.team.name}
                  </span>
                </div>
                <SimplePlayerList
                  players={awayTeam?.substitutes}
                  colors={awayTeam?.team.colors}
                  isSub={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamHeader = ({
  team,
  align,
  isMobile = false,
}: {
  team?: LineupTeam;
  align: "left" | "right";
  isMobile?: boolean;
}) => (
  <div
    className={`flex items-center gap-3 ${
      align === "right" && !isMobile
        ? "flex-row-reverse text-right"
        : "text-left"
    }`}
    style={{ minWidth: 0 }}
  >
    <div className="flex items-center gap-2">
      {team?.team.logo && (
        <Image
          src={team.team.logo}
          alt={team.team.name || ""}
          width={29}
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
    {team?.coach && !isMobile && (
      <div
        className={`flex items-center gap-2 mt-10 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
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

// Simple compact player list
const SimplePlayerList = ({
  players,
  colors,
  isSub = false,
}: {
  players?: {
    player: { id: number; name: string; number: number | null; pos: string | null };
  }[];
  colors?: LineupTeam["team"]["colors"];
  isSub?: boolean;
}) => (
  <div className="space-y-1">
    {players?.map(p => (
      <div
        key={p.player.id}
        className={`flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-[#333] ${
          isSub ? "opacity-75" : ""
        }`}
      >
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            backgroundColor:
              p.player.pos === "G"
                ? `#${colors?.goalkeeper.primary || "4A5568"}`
                : `#${colors?.player.primary || "4A5568"}`,
            color: getContrastColor(
              p.player.pos === "G"
                ? colors?.goalkeeper.primary
                : colors?.player.primary
            ),
          }}
        >
          {p.player.number}
        </div>
        <div className="min-w-0 flex-1 truncate">
          <span className={`${isSub ? "text-white/70" : "text-white"}`}>
            {p.player.name}
          </span>
          <span className="ml-1 text-white/40">({p.player.pos})</span>
        </div>
      </div>
    ))}
  </div>
);

// Helper function to ensure good contrast for jersey numbers
function getContrastColor(hexColor?: string): string {
  if (!hexColor) return "#000000";

  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
