#!/usr/bin/env tsx

/**
 * Script para poblar Firebase con datos desde hoy hasta los próximos 15 días
 * Uso: npx tsx scripts/populate-next-15-days.ts
 */

import { DataSyncer } from "../lib/background-sync/DataSyncer";
import { format, addDays } from "date-fns";
import { config } from "dotenv";

// Cargar variables de entorno
config({ path: ".env.local" });

async function populateNext15Days() {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: FOOTBALL_API_KEY no encontrada en .env.local");
    process.exit(1);
  }

  console.log("🚀 Iniciando población de próximos 15 días...");
  console.log("📅 Rango: Hoy hasta +15 días");

  const syncer = new DataSyncer(apiKey);

  // Generar fechas desde hoy hasta +15 días
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i <= 15; i++) {
    const date = addDays(today, i);
    dates.push(format(date, "yyyy-MM-dd"));
  }

  console.log(`📊 Procesando ${dates.length} días:`, dates);

  try {
    // Procesar cada fecha individualmente para evitar sobrecargar la API
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dayNum = i + 1;

      console.log(`\n📅 ${dayNum}/${dates.length}: Procesando ${date}...`);

      // Sync fixtures para esta fecha específica
      await syncer.queueFixturesSync([date]);
      await syncer.processQueue();

      // Pequeña pausa entre fechas para respetar rate limits
      if (i < dates.length - 1) {
        console.log("⏳ Esperando 15 segundos antes del siguiente día...");
        await new Promise(resolve => setTimeout(resolve, 15000));
      }

      const stats = syncer.getStats();
      console.log(
        `✅ Día ${dayNum} completado. API calls hoy: ${stats.apiCallsToday}`
      );

      // Parar si nos acercamos al límite de la API
      if (stats.apiCallsToday > 7000) {
        console.log(
          "⚠️ Acercándose al límite de API calls, pausando por seguridad..."
        );
        break;
      }
    }

    const finalStats = syncer.getStats();
    console.log("\n🎉 ¡Población de 15 días completada!");
    console.log("📊 Estadísticas finales:", {
      totalJobs: finalStats.totalJobs,
      completedJobs: finalStats.completedJobs,
      failedJobs: finalStats.failedJobs,
      apiCallsToday: finalStats.apiCallsToday,
      dataItemsSynced: finalStats.dataItemsSynced,
    });
  } catch (error) {
    console.error("❌ Error durante la población:", error);
    process.exit(1);
  }
}

// Manejar Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Recibido SIGINT, deteniendo población...");
  setTimeout(() => {
    console.log("👋 Script detenido");
    process.exit(0);
  }, 1000);
});

// Ejecutar el script
populateNext15Days()
  .then(() => {
    console.log("🎉 Script completado exitosamente!");
    process.exit(0);
  })
  .catch(error => {
    console.error("💥 Script falló:", error);
    process.exit(1);
  });
