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

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización - solo en producción
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sync = getSync();
    const startTime = Date.now();

    console.log("🚀 Starting automated preload job...");

    // Configuración: precargar próximos 14 días para ligas principales
    const days = 14;
    const leagues = [128, 129, 130, 2, 3, 848, 15];

    const preloadPromises = [];
    let successful = 0;
    let failed = 0;

    // Precargar por lotes para evitar sobrecarga
    const batchSize = 10;
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = format(addDays(today, i), "yyyy-MM-dd");

      for (const leagueId of leagues) {
        preloadPromises.push(
          sync
            .syncFixtures(leagueId, date, date)
            .then(() => {
              successful++;
              console.log(`✅ Preloaded league ${leagueId} for ${date}`);
            })
            .catch(error => {
              failed++;
              console.warn(
                `❌ Failed to preload league ${leagueId} for ${date}:`,
                error.message
              );
            })
        );

        // Procesar en lotes
        if (preloadPromises.length >= batchSize) {
          await Promise.all(preloadPromises);
          preloadPromises.length = 0; // Clear array

          // Pequeña pausa entre lotes
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Procesar lote final
    if (preloadPromises.length > 0) {
      await Promise.all(preloadPromises);
    }

    const duration = Date.now() - startTime;
    const total = days * leagues.length;

    console.log(
      `✅ Automated preload completed in ${duration}ms: ${successful}/${total} successful`
    );

    // Log del resultado para monitoreo
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      stats: {
        successful,
        failed,
        total,
        days,
        leagues: leagues.length,
      },
      message: `Precarga automática completada: ${successful}/${total} exitosas en ${duration}ms`,
    };

    // En desarrollo, también log a consola
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Automated preload result:", result);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in automated preload job:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error en la precarga automática",
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// También permitir ejecución manual con POST
export async function POST(request: NextRequest) {
  try {
    const { days = 14, leagues, force = false } = await request.json();

    const sync = getSync();
    const startTime = Date.now();

    console.log(`🔧 Manual preload triggered: ${days} days, force=${force}`);

    // Ligas por defecto
    const defaultLeagues = [128, 129, 130, 2, 3, 848, 15];
    const targetLeagues = leagues || defaultLeagues;

    const preloadPromises = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < days; i++) {
      const date = format(addDays(new Date(), i), "yyyy-MM-dd");

      for (const leagueId of targetLeagues) {
        preloadPromises.push(
          (async () => {
            try {
              // Si no es forzado, verificar si ya tenemos datos
              if (!force) {
                const hasData = await sync.hasFixturesData(leagueId, date);
                if (hasData) {
                  console.log(
                    `⏭️ Skipping league ${leagueId} for ${date} (already exists)`
                  );
                  return;
                }
              }

              await sync.syncFixtures(leagueId, date, date);
              successful++;
              console.log(
                `✅ Manually preloaded league ${leagueId} for ${date}`
              );
            } catch (error) {
              failed++;
              console.warn(
                `❌ Failed to manually preload league ${leagueId} for ${date}:`,
                error instanceof Error ? error.message : String(error)
              );
            }
          })()
        );
      }
    }

    await Promise.all(preloadPromises);

    const duration = Date.now() - startTime;
    const total = days * targetLeagues.length;

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      stats: {
        successful,
        failed,
        total,
        days,
        leagues: targetLeagues.length,
        force,
      },
      message: `Precarga manual completada: ${successful}/${total} procesadas en ${duration}ms`,
    };

    console.log("📊 Manual preload result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in manual preload:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error en la precarga manual",
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
