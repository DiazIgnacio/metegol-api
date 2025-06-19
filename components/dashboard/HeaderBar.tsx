"use client";

import { SearchIcon, ChevronDown } from "lucide-react";

export default function HeaderBar() {
  return (
    <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 rounded-xl shadow-md">
      {/* En Vivo */}
      <span className="text-green-400 font-semibold text-sm">
        ● En Vivo<span className="text-white">(1)</span>
      </span>

      {/* Buscador */}
      <div className="flex items-center bg-[#333] px-3 py-1 rounded-full w-full mx-3">
        <SearchIcon className="w-4 h-4 text-white/50 mr-2" />
        <input
          type="text"
          placeholder="Buscar Partido"
          className="bg-transparent text-sm text-white placeholder:text-white/50 outline-none w-full"
        />
      </div>

      {/* Dropdown Todos */}
      <div className="flex items-center gap-1 text-sm text-white/70">
        Todos
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
