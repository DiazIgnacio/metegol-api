"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { Team } from "@/types/match";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { abbreviateTeamName } from "@/lib/utils";

interface SearchDropdownProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchDropdown({
  className = "",
  onClose,
  autoFocus = false,
}: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navigating, setNavigating] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto focus when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onClose && !query) {
          onClose();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, query]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setTeams([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/teams?search=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setTeams(data.teams || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching teams:", error);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleTeamSelect = (team: Team) => {
    setNavigating(team.id);
    setQuery("");
    setIsOpen(false);
    if (onClose) onClose();
    router.push(`/teams/${team.id}`);
  };

  const handleClose = () => {
    setQuery("");
    setTeams([]);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const clearSearch = () => {
    setQuery("");
    setTeams([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {onClose && (
          <button
            onClick={handleClose}
            className="mr-3 rounded-lg p-1 transition-colors hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar equipos..."
            className="w-full rounded-lg border border-gray-600 bg-gray-800 py-2 pr-10 pl-10 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Buscando equipos...
            </div>
          ) : teams.length > 0 ? (
            teams.map(team => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                disabled={navigating === team.id}
                className="flex w-full items-center space-x-3 border-b border-gray-700 p-3 text-left transition-colors last:border-b-0 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 flex-shrink-0 object-contain"
                />
                <div className="flex w-full items-center justify-between">
                  <span className="truncate text-sm font-medium text-white">
                    {abbreviateTeamName(team.name)}
                  </span>
                  {navigating === team.id && (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      <span className="text-xs text-gray-400">Cargando...</span>
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-400">
              No se encontraron equipos
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
