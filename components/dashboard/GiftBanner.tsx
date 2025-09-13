"use client";

import Image from "next/image";

export default function GiftBanner() {
  return (
    <div className="relative w-full overflow-hidden px-2 shadow-md">
      {/* Imagen de la camiseta */}
      <Image
        src="/ads.png" // Asegurate de mover la imagen a /public y renombrarla así
        alt="Sorteo de camiseta"
        width={200}
        height={100}
        className="h-auto w-full object-cover"
        priority
      />
    </div>
  );
}
