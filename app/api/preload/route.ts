import { NextRequest, NextResponse } from "next/server";
import { BackgroundSync } from "@/lib/background-sync/background-sync";
import { format, addDays } from "date-fns";

// Global instance to avoid reinitialization
let globalSync: BackgroundSync | null = null;

function getSync(): BackgroundSync {
  if (!globalSync) {
    globalSync = new BackgroundSync();
  }
  return globalSync;
}

export async function POST(request: NextRequest) {
  try {
    const { days = 14, leagues } = await request.json();

    const sync = getSync();

    // Ligas por defecto si no se especifican
    const defaultLeagues = [128, 129, 130, 2, 3, 848, 15];
    const targetLeagues = leagues || defaultLeagues;

    console.log(
      `🚀 Starting preload for ${days} days, ${targetLeagues.length} leagues`
    );

    // Precargar las próximas 2 semanas
    const preloadPromises = [];

    for (let i = 0; i < days; i++) {
      const date = format(addDays(new Date(), i), "yyyy-MM-dd");

      for (const leagueId of targetLeagues) {
        preloadPromises.push(
          sync.syncFixtures(leagueId, date, date).catch(error => {
            console.warn(
              `Failed to preload league ${leagueId} for ${date}:`,
              error
            );
            return null;
          })
        );
      }
    }

    // Ejecutar todas las precargas en paralelo
    const results = await Promise.all(preloadPromises);
    const successful = results.filter(r => r !== null).length;
    const total = preloadPromises.length;

    console.log(`✅ Preload completed: ${successful}/${total} successful`);

    return NextResponse.json({
      success: true,
      message: `Precarga completada: ${successful}/${total} exitosas`,
      stats: {
        successful,
        total,
        days,
        leagues: targetLeagues.length,
      },
    });
  } catch (error) {
    console.error("Error in preload:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error en la precarga de partidos",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "status") {
    try {
      const sync = getSync();

      // Verificar qué datos tenemos precargados
      const today = new Date();
      const checkDates = [];

      for (let i = 0; i < 7; i++) {
        checkDates.push(format(addDays(today, i), "yyyy-MM-dd"));
      }

      const statusPromises = checkDates.map(async date => {
        const defaultLeagues = [128, 129, 130, 2, 3, 848, 15];
        const leagueStatus = await Promise.all(
          defaultLeagues.map(async leagueId => {
            const hasData = await sync.hasFixturesData(leagueId, date);
            return { leagueId, hasData };
          })
        );

        return {
          date,
          leagues: leagueStatus,
        };
      });

      const status = await Promise.all(statusPromises);

      return NextResponse.json({
        success: true,
        status,
        message: "Estado de precarga obtenido",
      });
    } catch (error) {
      console.error("Error getting preload status:", error);
      return NextResponse.json(
        { error: "Error al obtener estado de precarga" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Acción no válida. Use ?action=status" },
    { status: 400 }
  );
}
