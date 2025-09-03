import MainDashboard from "@/components/dashboard/MainDashboard";
import Navbar from "@/components/Navbar"; // Asegurate que lo tengas

export default function Home() {
  return (
    <div className="h-screen flex flex-col px-2 text-white font-sans overflow-hidden">
      {/* Logo + Navbar slide-in */}
      <Navbar />

      {/* Dashboard principal */}
      <div className="bg-[#222222] border border-transparent rounded-2xl p-2 mb-2 flex-1 overflow-hidden">
        <MainDashboard />
      </div>
    </div>
  );
}
