import MainDashboard from "@/components/dashboard/MainDashboard";
import Navbar from "@/components/Navbar"; // Asegurate que lo tengas

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans text-white">
      {/* Logo + Navbar slide-in */}
      <Navbar />

      {/* Dashboard principal */}
      <div className="mt-2 mb-1 flex-1 overflow-hidden rounded-2xl border border-transparent bg-[#222222] p-1">
        <MainDashboard />
      </div>
    </div>
  );
}
