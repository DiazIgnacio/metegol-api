"use client";

import { useState } from "react";
import { Maximize, Minimize, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WhiteLogo from "@/public/logos/White_Logo.png";
import SearchDropdown from "./SearchDropdown";

export default function NavbarMobile() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
      {!showSearch ? (
        <div className="flex items-center justify-between p-4 rounded bg-black text-white">
          {/* Logo */}
          <Link href="/">
            <Image
              src={WhiteLogo}
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto cursor-pointer"
              priority
            />
          </Link>

          <div className="flex items-center space-x-3">
            {/* Search toggle */}
            <button 
              onClick={() => setShowSearch(true)} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Fullscreen toggle */}
            <button onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded bg-black text-white">
          <SearchDropdown 
            className="w-full" 
            onClose={() => setShowSearch(false)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}