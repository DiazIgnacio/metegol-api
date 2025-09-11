"use client";

import Image from "next/image";

export default function GiftBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-md">
      {/* Imagen de la camiseta */}
      <Image
        src="/gift.png" // Asegurate de mover la imagen a /public y renombrarla así
        alt="Sorteo de camiseta"
        width={800}
        height={200}
        className="h-auto w-full object-cover"
        priority
      />
    </div>
  );
}
