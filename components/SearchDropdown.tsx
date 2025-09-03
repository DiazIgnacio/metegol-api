"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { Team } from "@/types/match";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchDropdownProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchDropdown({ 
  className = "", 
  onClose,
  autoFocus = false 
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
            className="mr-3 p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar equipos..."
            className="w-full pl-10 pr-10 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Buscando equipos...
            </div>
          ) : teams.length > 0 ? (
            teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                disabled={navigating === team.id}
                className="w-full p-3 text-left hover:bg-gray-700 flex items-center space-x-3 border-b border-gray-700 last:border-b-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain flex-shrink-0"
                />
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-white truncate">
                    {team.name}
                  </span>
                  {navigating === team.id && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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