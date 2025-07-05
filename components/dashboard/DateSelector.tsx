"use client";

import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  
  // Check if selected date is one of the quick buttons
  const isQuickDate = isSameDay(selectedDate, yesterday) || isSameDay(selectedDate, today) || isSameDay(selectedDate, tomorrow);

  return (
    <div className="flex justify-between px-3 py-2 mt-3 gap-2 overflow-x-auto scrollbar-none text-xs">
      {[yesterday, today, tomorrow].map((day, i) => (
        <button
          key={i}
          onClick={() => onDateChange(day)}
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

      {/* Shadcn Calendar Date Picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`px-3 py-1 h-auto rounded-full border-none hover:bg-[#444] flex flex-col items-center justify-center text-xs transition-all ${
              !isQuickDate 
                ? "bg-lime-500 text-black font-bold" 
                : "bg-[#333] text-white"
            }`}
          >
            <CalendarIcon className="h-4 w-4 mb-0.5" />
            {!isQuickDate ? (
              <span>{format(selectedDate, "dd MMM", { locale: es })}</span>
            ) : (
              <span>Fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#333]" align="end">
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
            className="text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
