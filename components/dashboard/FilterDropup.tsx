"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronUp, Globe, Trophy, X } from "lucide-react";
import { League } from "@/types/match";

interface FilterDropupProps {
  leagues: League[];
  selectedCountry?: string | null;
  selectedLeague?: number | null;
  onCountryChange: (country: string | null) => void;
  onLeagueChange: (leagueId: number | null) => void;
}

export default function FilterDropup({
  leagues,
  selectedCountry = null,
  selectedLeague = null,
  onCountryChange,
  onLeagueChange,
}: FilterDropupProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Agrupamos ligas por país
  const leaguesByCountry = useMemo(() => {
    const grouped = leagues.reduce<Record<string, League[]>>((acc, league) => {
      const country = league.country || "Unknown";
      if (!acc[country]) acc[country] = [];
      acc[country].push(league);
      return acc;
    }, {});

    // Ordenamos países con Argentina primero
    const countries = Object.keys(grouped).sort((a, b) => {
      if (a === "Argentina") return -1;
      if (b === "Argentina") return 1;
      if (a === "Europe") return -1;
      if (b === "Europe") return 1;
      if (a === "South America") return -1;
      if (b === "South America") return 1;
      return a.localeCompare(b);
    });

    return countries.reduce<Record<string, League[]>>((acc, country) => {
      acc[country] = grouped[country];
      return acc;
    }, {});
  }, [leagues]);

  const uniqueCountries = Object.keys(leaguesByCountry);

  const clearAllFilters = () => {
    onCountryChange(null);
    onLeagueChange(null);
  };

  const getDisplayText = () => {
    if (selectedLeague) {
      const league = leagues.find(l => l.id === selectedLeague);
      return league?.name || `Liga ${selectedLeague}`;
    }
    if (selectedCountry) {
      const leagueCount = leaguesByCountry[selectedCountry]?.length || 0;
      return `${selectedCountry} (${leagueCount})`;
    }
    return "Filtrar por País o Liga";
  };

  const hasActiveFilters = selectedCountry || selectedLeague;

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
          hasActiveFilters
            ? "border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 text-white shadow-lg"
            : "border-white/30 bg-gradient-to-br from-gray-800/80 to-gray-700/70 text-white/90 hover:border-white/50 hover:bg-gradient-to-br hover:from-gray-700/90 hover:to-gray-600/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            {selectedLeague ? (
              <Trophy className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          <span className="truncate">{getDisplayText()}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={e => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-colors duration-200 hover:bg-white/30"
              title="Limpiar filtros"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronUp
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Contenido del dropdown */}
          <div className="absolute right-0 bottom-full left-0 z-50 mb-2 max-h-96 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/95 to-gray-800/95 shadow-2xl backdrop-blur-xl">
            {/* Header con opciones rápidas */}
            <div className="border-b border-white/10 p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsOpen(false);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    !hasActiveFilters
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-white/30 bg-white/10 text-white/80 hover:border-white/50 hover:bg-white/20"
                  }`}
                >
                  Todas las ligas
                </button>
              </div>
            </div>

            {/* Lista scrolleable */}
            <div className="scrollbar-hide max-h-80 overflow-y-auto">
              {/* Sección de Países */}
              <div className="border-b border-white/10 p-3">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Globe className="h-4 w-4" />
                  Países
                </h3>
                <div className="space-y-1">
                  {uniqueCountries.map(country => (
                    <button
                      key={country}
                      onClick={() => {
                        onCountryChange(
                          country === selectedCountry ? null : country
                        );
                        onLeagueChange(null);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        selectedCountry === country
                          ? "bg-blue-500/20 text-blue-300"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{country}</span>
                      <span className="text-xs text-white/60">
                        ({leaguesByCountry[country].length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección de Ligas */}
              <div className="p-3">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Trophy className="h-4 w-4" />
                  Ligas
                </h3>
                <div className="space-y-3">
                  {Object.entries(leaguesByCountry).map(
                    ([country, countryLeagues]) => (
                      <div key={country}>
                        <h4 className="mb-2 text-xs font-medium tracking-wide text-white/60 uppercase">
                          {country}
                        </h4>
                        <div className="space-y-1">
                          {countryLeagues.map(league => (
                            <button
                              key={league.id}
                              onClick={() => {
                                onLeagueChange(
                                  league.id === selectedLeague
                                    ? null
                                    : league.id
                                );
                                onCountryChange(null);
                                setIsOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                selectedLeague === league.id
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "text-white/80 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <Image
                                  src={league.logo}
                                  alt={league.name}
                                  width={20}
                                  height={20}
                                  className="object-contain brightness-150 contrast-120"
                                />
                              </div>
                              <span className="truncate">{league.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
