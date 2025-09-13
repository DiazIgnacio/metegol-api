"use client";

import { SearchIcon } from "lucide-react";

interface HeaderBarProps {
  liveCount: number;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export default function HeaderBar({
  liveCount,
  searchTerm,
  onSearchTermChange,
}: HeaderBarProps) {
  return (
    <div className="flex items-center rounded-xl bg-[#1a1a1a] px-4 py-2 shadow-md">
      {/* En Vivo dinámico */}
      <span className="text-sm font-semibold text-green-400">
        ● En Vivo <span className="text-white">({liveCount})</span>
      </span>

      {/* Buscador */}
      <div className="mx-3 flex flex-1 items-center rounded-full bg-[#333] px-3 py-1">
        <SearchIcon className="mr-2 h-4 w-4 text-white/50" />
        <input
          type="text"
          placeholder="Buscar Partido"
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />
      </div>
    </div>
  );
}
