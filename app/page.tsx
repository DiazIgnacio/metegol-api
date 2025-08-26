import MainDashboard from "@/components/dashboard/MainDashboard";
import Navbar from "@/components/Navbar"; // Asegurate que lo tengas
import GiftBanner from "@/components/dashboard/GiftBanner";

export default function Home() {
  return (
    <div className="h-screen flex flex-col px-2 text-white font-sans overflow-hidden">
      {/* Logo + Navbar slide-in */}
      <Navbar />

      {/* Sorteo de camiseta */}
      <div className="px-3 my-2 flex-shrink-0">
        <GiftBanner />
      </div>

      {/* Dashboard principal */}
      <div className="bg-[#222222] border border-transparent rounded-2xl p-2 mb-2 flex-1 overflow-hidden">
        <MainDashboard />
      </div>
    </div>
  );
}
