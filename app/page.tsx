import { Card } from "@/components/ui/card";
import TeamMatches from "@/components/TeamMatches";
import { Suspense, use } from "react";
import { FootballApi } from "@/lib/footballApi";

export default function Home() {
  const matches = use(FootballApi.getMatches());
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-2xl mb-10 p-8 flex flex-col items-center gap-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          Bienvenido a Metegol Estadísticas de Fútbol
        </h1>
        <p className="text-center text-muted-foreground max-w-md">
          Explora los partidos recientes de equipos de fútbol y sus estadísticas,
          presentados de forma moderna con componentes Shadcn UI.
        </p>
      </Card>
      <Suspense fallback={<p className="text-center text-muted-foreground">Cargando partidos...</p>}>
        <TeamMatches matches={matches} />
      </Suspense>
    </div>
  );
}
