import { getMatches } from "@/lib/server/match-fetcher";
import MainDashboard from "@/components/dashboard/MainDashboard";
import Navbar from "@/components/Navbar"; // Asegurate que lo tengas
import GiftBanner from "@/components/dashboard/GiftBanner";
import SubNavbar from "@/components/dashboard/SubNavbar";

export default async function Home() {
  const matches = await getMatches();

  return (
    <div className="px-2 text-white font-sans">
      {/* Logo + Navbar slide-in */}
      <Navbar />

      {/* Sorteo de camiseta */}
      <div className="px-3 my-2">
        <GiftBanner />
      </div>

      {/* Dashboard principal */}
      <div className="bg-[#222222] border border-transparent rounded-2xl p-2 mb-2">
        <MainDashboard matches={matches} />
        <SubNavbar />
      </div>
    </div>
  );
}
