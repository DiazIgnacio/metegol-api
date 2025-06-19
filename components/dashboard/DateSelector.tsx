"use client";

import { useState } from "react";
import { addDays, format, subDays } from "date-fns";

export default function DateSelector() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

  return (
    <div className="flex justify-between px-3 py-2 mt-3 gap-2 overflow-x-auto scrollbar-none text-xs">
      {[yesterday, today, tomorrow].map((day, i) => (
        <button
          key={i}
          onClick={() => setSelectedDate(day)}
          className={`px-3 py-1 rounded-full transition-all ${
            isSameDay(selectedDate, day)
              ? "bg-lime-500 text-black font-bold"
              : "bg-[#1a1a1a] text-white/70 hover:bg-[#333]"
          }`}
        >
          {i === 0 ? "Ayer" : i === 1 ? "Hoy" : "Mañana"}
          <br />
          <span className="text-xs">{format(day, "dd MMM")}</span>
        </button>
      ))}

      {/* Input date nativo */}
      <label
        className="px-3 py-1 rounded-full bg-[#333] text-white flex flex-col items-center justify-center cursor-pointer"
        title="Seleccionar fecha"
      >
        📅 <span className="text-xs mt-0.5">Fecha</span>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="hidden"
        />
      </label>
    </div>
  );
}
