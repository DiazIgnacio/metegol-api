"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function NavbarMobile() {
  const [open, setOpen] = useState(false);

  const navItems = [
    "Historicos Por Clubes",
    "Mercado De Pases",
    "Apuestas",
    "Sorteos",
    "Descuentos En Camisetas",
    "Reserva De Canchas",
    "Falta Uno",
    "Contacto",
  ];

  return (
    <div className="relative z-50">
      <div className="flex items-center justify-between p-4 rounded bg-black text-white">
        {/* Logo placeholder */}
        <div className="text-xl font-bold tracking-widest">FULBOOOO</div>

        {/* Menu toggle */}
        <button onClick={() => setOpen(!open)} className="z-50">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[250px] bg-black text-white shadow-lg transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-4 p-6 mt-10">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href="#"
              className="border-b border-white/20 pb-2 text-lg hover:text-purple-400 transition-colors"
            >
              {item}
            </Link>
          ))}
          <div className="mt-6 text-xs text-center text-muted-foreground">
            FULBOOOO
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}