"use client";

import { useState } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function NavbarMobile() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative z-50">
      <div className="flex items-center justify-between p-4 rounded bg-black text-white">
        {/* Logo placeholder */}
        <div className="text-xl font-bold tracking-widest">FULBOOOO</div>

        {/* Fullscreen toggle */}
        <button onClick={toggleFullscreen} className="z-50">
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}