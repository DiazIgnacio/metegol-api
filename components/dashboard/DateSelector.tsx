"use client";

import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const quickDates = [
    { label: "Ayer", date: yesterday },
    { label: "Hoy", date: today },
    { label: "Mañana", date: tomorrow },
  ];

  return (
    <div className="flex items-center px-4 py-2 gap-2 overflow-x-auto scrollbar-none">
      {quickDates.map(({ label, date }) => {
        const selected = isSameDay(selectedDate, date);
        return (
          <button
            key={label}
            onClick={() => onDateChange(date)}
            className={`
              flex flex-col items-center justify-center
              px-4 py-2 rounded-lg border text-center whitespace-nowrap text-xs
              transition-colors w-1/4
              ${selected
                ? "border-lime-500 text-lime-500 font-semibold"
                : "border-gray-700 text-white/70 hover:bg-[#333]"}
            `}
          >
            <span>{label}</span>
            <span className="mt-0.5">{format(date, "dd MMM", { locale: es })}</span>
          </button>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`
              flex items-center gap-1
              px-4 py-2 rounded-lg border text-xs
              border-gray-700 text-white/70 hover:bg-[#333]
              transition-colors
            `}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendario</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-auto p-0 bg-[#1a1a1a] border border-gray-700 rounded-md"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                setOpen(false);
              }
            }}
            initialFocus
            className="bg-transparent text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
