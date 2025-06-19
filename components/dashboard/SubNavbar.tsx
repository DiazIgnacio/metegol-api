"use client";

import Image from "next/image";

const leagues = [
  { name: "Liga Profesional", logo: "/leagues/lpf.png" },
  { name: "Primera Nacional", logo: "/leagues/nacional.png" },
  { name: "Copa Argentina", logo: "/leagues/copa-arg.png" },
  { name: "Champions League", logo: "/leagues/ucl.png" },
  { name: "Europa League", logo: "/leagues/uel.png" },
  { name: "Conference League", logo: "/leagues/uecl.png" },
  { name: "Mundial Clubes", logo: "/leagues/cwc.png" },
];

export default function SubNavbar() {
  return (
    <div className="bg-[#0c0c0c] py-2 px-2 rounded-2xl shadow-inner overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="flex items-center gap-4">
        {leagues.map((league, index) => (
          <button
            key={index}
            title={league.name}
            className="flex-shrink-0 focus:outline-none hover:scale-105 transition-transform"
          >
            <Image
              src={league.logo}
              alt={league.name}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </button>
        ))}

        {/* Flecha final */}
        <div className="flex-shrink-0 w-8 h-8 bg-[#333] rounded-full flex items-center justify-center ml-2">
          <span className="text-white text-lg">{">"}</span>
        </div>
      </div>
    </div>
  );
}
