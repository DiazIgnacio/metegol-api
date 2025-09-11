"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FootballApi } from "@/lib/footballApi";
import type { League } from "@/types/match";

interface SubNavbarProps {
  selectedLeague?: number | null;
  onLeagueChange: (leagueId: number | null) => void;
}

// Ligas principales con mejores URLs de logos
const STATIC_LEAGUES: League[] = [
  // Argentina - Sistema completo
  {
    id: 128,
    name: "Liga Profesional",
    logo: "https://media.api-sports.io/football/leagues/128.png",
    country: "Argentina",
  },
  {
    id: 129,
    name: "Primera Nacional",
    logo: "https://media.api-sports.io/football/leagues/129.png",
    country: "Argentina",
  },
  {
    id: 130,
    name: "Copa Argentina",
    logo: "https://media.api-sports.io/football/leagues/130.png",
    country: "Argentina",
  },
  {
    id: 131,
    name: "Copa de la Liga",
    logo: "https://media.api-sports.io/football/leagues/131.png",
    country: "Argentina",
  },
  {
    id: 132,
    name: "Supercopa Argentina",
    logo: "https://media.api-sports.io/football/leagues/132.png",
    country: "Argentina",
  },
  {
    id: 133,
    name: "Primera B",
    logo: "https://media.api-sports.io/football/leagues/133.png",
    country: "Argentina",
  },
  {
    id: 134,
    name: "Primera C",
    logo: "https://media.api-sports.io/football/leagues/134.png",
    country: "Argentina",
  },
  {
    id: 484,
    name: "Torneo Federal A",
    logo: "https://media.api-sports.io/football/leagues/484.png",
    country: "Argentina",
  },

  // UEFA - Competencias europeas
  {
    id: 2,
    name: "Champions League",
    logo: "https://media.api-sports.io/football/leagues/2.png",
    country: "Europe",
  },
  {
    id: 3,
    name: "Europa League",
    logo: "https://media.api-sports.io/football/leagues/3.png",
    country: "Europe",
  },
  {
    id: 848,
    name: "Conference League",
    logo: "https://media.api-sports.io/football/leagues/848.png",
    country: "Europe",
  },

  // España - Top tier
  {
    id: 140,
    name: "La Liga",
    logo: "https://media.api-sports.io/football/leagues/140.png",
    country: "Spain",
  },
  {
    id: 143,
    name: "Copa del Rey",
    logo: "https://media.api-sports.io/football/leagues/143.png",
    country: "Spain",
  },

  // Inglaterra - Premier League system
  {
    id: 39,
    name: "Premier League",
    logo: "https://media.api-sports.io/football/leagues/39.png",
    country: "England",
  },
  {
    id: 45,
    name: "FA Cup",
    logo: "https://media.api-sports.io/football/leagues/45.png",
    country: "England",
  },

  // Italia - Serie A system
  {
    id: 135,
    name: "Serie A",
    logo: "https://media.api-sports.io/football/leagues/135.png",
    country: "Italy",
  },
  {
    id: 137,
    name: "Coppa Italia",
    logo: "https://media.api-sports.io/football/leagues/137.png",
    country: "Italy",
  },

  // Alemania - Bundesliga system
  {
    id: 78,
    name: "Bundesliga",
    logo: "https://media.api-sports.io/football/leagues/78.png",
    country: "Germany",
  },
  {
    id: 81,
    name: "DFB Pokal",
    logo: "https://media.api-sports.io/football/leagues/81.png",
    country: "Germany",
  },

  // Francia - Ligue 1 system
  {
    id: 61,
    name: "Ligue 1",
    logo: "https://media.api-sports.io/football/leagues/61.png",
    country: "France",
  },
  {
    id: 66,
    name: "Coupe de France",
    logo: "https://media.api-sports.io/football/leagues/66.png",
    country: "France",
  },

  // Brasil - Sistema brasileiro
  {
    id: 71,
    name: "Brasileirão",
    logo: "https://media.api-sports.io/football/leagues/71.png",
    country: "Brazil",
  },
  {
    id: 73,
    name: "Copa do Brasil",
    logo: "https://media.api-sports.io/football/leagues/73.png",
    country: "Brazil",
  },

  // Portugal
  {
    id: 94,
    name: "Primeira Liga",
    logo: "https://media.api-sports.io/football/leagues/94.png",
    country: "Portugal",
  },

  // Holanda
  {
    id: 88,
    name: "Eredivisie",
    logo: "https://media.api-sports.io/football/leagues/88.png",
    country: "Netherlands",
  },

  // CONMEBOL - Copas sudamericanas
  {
    id: 13,
    name: "Copa Libertadores",
    logo: "https://media.api-sports.io/football/leagues/13.png",
    country: "South America",
  },
  {
    id: 11,
    name: "Copa Sudamericana",
    logo: "https://media.api-sports.io/football/leagues/11.png",
    country: "South America",
  },

  // Mundial
  {
    id: 15,
    name: "Mundial de Clubes",
    logo: "https://media.api-sports.io/football/leagues/15.png",
    country: "World",
  },
  {
    id: 1,
    name: "Copa del Mundo",
    logo: "https://media.api-sports.io/football/leagues/1.png",
    country: "World",
  },
];

export default function SubNavbar({
  selectedLeague = null,
  onLeagueChange,
}: SubNavbarProps) {
  const [leagues, setLeagues] = useState<League[]>(STATIC_LEAGUES);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const fetched = await FootballApi.getLeagues();
        // Merge: priorizamos los logos locales para la estética
        const merged = STATIC_LEAGUES.map(staticL => {
          const remote = fetched.find(
            (f: { id?: number; league?: { id: number } }) =>
              f.id === staticL.id || f.league?.id === staticL.id
          );
          if (remote?.league) {
            return {
              ...staticL,
              id: remote.league.id,
              name: remote.league.name,
              country:
                remote.league.country || remote.country || staticL.country,
              logo: staticL.logo,
            };
          } else if (remote) {
            return { ...staticL, ...remote, logo: staticL.logo };
          }
          return staticL;
        });
        setLeagues(merged);
      } catch {
        setLeagues(STATIC_LEAGUES);
      }
    };
    fetchLeagues();
  }, []);

  // Organizamos todas las ligas con Argentina al principio
  const allLeagues = useMemo(() => {
    // Ordenamos con Argentina primero, luego el resto
    const lpf = leagues.find(l => l.id === 128); // Liga Profesional destacada
    const argentine = leagues.filter(
      l => l.country === "Argentina" && l.id !== 128
    );
    const uefa = leagues.filter(l => l.country === "Europe");
    const topEuropean = leagues.filter(l =>
      ["Spain", "England", "Italy", "Germany", "France"].includes(
        l.country || ""
      )
    );
    const southAmerican = leagues.filter(l => l.country === "South America");
    const brazilian = leagues.filter(l => l.country === "Brazil");
    const others = leagues.filter(
      l =>
        ![
          "Argentina",
          "Europe",
          "Spain",
          "England",
          "Italy",
          "Germany",
          "France",
          "South America",
          "Brazil",
          "World",
        ].includes(l.country || "")
    );
    const world = leagues.filter(l => l.country === "World");

    return [
      ...(lpf ? [lpf] : []), // Liga Profesional primero
      ...argentine, // Resto de ligas argentinas
      ...uefa, // UEFA después
      ...topEuropean, // Top 5 europeas
      ...southAmerican, // CONMEBOL
      ...brazilian, // Brasil
      ...others, // Otras ligas
      ...world, // Mundiales
    ];
  }, [leagues]);

  const isSelected = (id?: number | null) => selectedLeague === id;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-800/80 via-gray-700/70 to-gray-800/80 shadow-2xl backdrop-blur-xl">
      {/* Efectos de glow más brillantes */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-400/12 via-white/5 to-cyan-400/12" />
      <div className="pointer-events-none absolute -top-6 left-1/4 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl" />
      <div className="pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />

      {/* Container principal con scroll personalizado */}
      <div className="relative">
        {/* Gradientes de fade más suaves */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-gradient-to-r from-gray-800/80 to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-6 bg-gradient-to-l from-gray-800/80 to-transparent" />

        {/* Lista scrolleable de ligas */}
        <div
          className="flex items-center gap-3 overflow-x-auto scroll-smooth px-5 py-3"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Botón Todas - más brillante */}
          <div className="flex-shrink-0">
            <button
              onClick={() => onLeagueChange(null)}
              className={`group relative rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedLeague === null
                  ? "border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30"
                  : "border-white/30 bg-white/15 text-white/95 hover:border-white/50 hover:bg-white/25 hover:text-white"
              }`}
            >
              <span className="relative z-10">Todas</span>
              {selectedLeague === null && (
                <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-400/20 blur" />
              )}
            </button>
          </div>

          {/* Separador más brillante */}
          <div className="h-6 w-px flex-shrink-0 bg-gradient-to-b from-transparent via-white/35 to-transparent" />

          {/* Liga Profesional Argentina destacada */}
          {allLeagues.find(l => l.id === 128) && (
            <div className="flex-shrink-0">
              <button
                onClick={() => onLeagueChange(128)}
                title="Liga Profesional Argentina"
                className={`group relative rounded-xl border border-white/30 bg-gradient-to-br from-white/15 to-white/25 p-2 transition-all duration-300 hover:border-white/50 hover:from-white/25 hover:to-white/35 ${isSelected(128) ? "scale-105 bg-gradient-to-br from-sky-400/20 to-blue-500/20 shadow-lg ring-2 shadow-sky-400/25 ring-sky-400" : "hover:scale-105"}`}
              >
                <Image
                  src="https://media.api-sports.io/football/leagues/128.png"
                  alt="Liga Profesional"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain brightness-150 contrast-120 saturate-120 transition-all duration-300 group-hover:brightness-175"
                />
                {isSelected(128) && (
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-gradient-to-r from-sky-400/30 to-blue-500/30 blur" />
                )}
              </button>
            </div>
          )}

          {/* Resto de ligas organizadas - iconos más brillantes */}
          {allLeagues
            .filter(l => l.id !== 128)
            .map(league => {
              const isUEFA = league.country === "Europe";
              const isTopLeague = [
                "Spain",
                "England",
                "Italy",
                "Germany",
                "France",
              ].includes(league.country || "");
              const isSouthAmerican = league.country === "South America";
              const isWorld = league.country === "World";
              const isArgentine = league.country === "Argentina";

              let size = 32;
              let ringColor = "ring-white/60";
              let glowColor = "from-white/20 to-white/30";

              if (isUEFA) {
                size = 36;
                ringColor = "ring-blue-400";
                glowColor = "from-blue-400/20 to-purple-500/20";
              } else if (isTopLeague) {
                size = 34;
                ringColor = "ring-yellow-400";
                glowColor = "from-yellow-400/20 to-orange-500/20";
              } else if (isSouthAmerican) {
                size = 36;
                ringColor = "ring-orange-400";
                glowColor = "from-orange-400/20 to-red-500/20";
              } else if (isWorld) {
                size = 38;
                ringColor = "ring-emerald-400";
                glowColor = "from-emerald-400/20 to-teal-500/20";
              } else if (isArgentine) {
                size = 30;
                ringColor = "ring-sky-400";
                glowColor = "from-sky-400/20 to-cyan-500/20";
              }

              return (
                <div key={league.id} className="flex-shrink-0">
                  <button
                    onClick={() => onLeagueChange(league.id)}
                    title={league.name}
                    className={`group relative rounded-lg border border-white/30 bg-gradient-to-br from-white/15 to-white/25 p-2 transition-all duration-300 hover:scale-110 hover:border-white/50 hover:from-white/25 hover:to-white/35 ${isSelected(league.id) ? `ring-2 ${ringColor} scale-105 bg-gradient-to-br shadow-lg ${glowColor}` : ""}`}
                  >
                    <Image
                      src={league.logo}
                      alt={league.name}
                      width={size}
                      height={size}
                      className={`object-contain brightness-150 contrast-120 saturate-120 transition-all duration-300 group-hover:brightness-175 ${isSelected(league.id) ? "brightness-175" : ""}`}
                      style={{ width: `${size}px`, height: `${size}px` }}
                    />
                    {isSelected(league.id) && (
                      <div
                        className={`absolute -inset-1 rounded-lg bg-gradient-to-r ${glowColor} animate-pulse blur`}
                      />
                    )}
                  </button>
                </div>
              );
            })}

          {/* Espaciador final */}
          <div className="w-2 flex-shrink-0" />
        </div>
      </div>

      {/* CSS para scroll suave y ocultar scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        div {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
