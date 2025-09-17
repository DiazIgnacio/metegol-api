/**
 * Script para precargar partidos futuros
 * Uso: node scripts/preload-future-matches.js [días] [ligas]
 */

const { format, addDays } = require("date-fns");

async function preloadMatches() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Parámetros desde línea de comandos
  const days = parseInt(process.argv[2]) || 14;
  const leaguesArg = process.argv[3];
  const leagues = leaguesArg
    ? leaguesArg.split(",").map(id => parseInt(id.trim()))
    : undefined;

  console.log(`🚀 Preloading matches for next ${days} days...`);
  if (leagues) {
    console.log(`📊 Leagues: ${leagues.join(", ")}`);
  } else {
    console.log(`📊 Using default leagues: 128, 129, 130, 2, 3, 848, 15`);
  }

  try {
    const response = await fetch(`${baseUrl}/api/preload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        days,
        leagues,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`📊 Stats:`, result.stats);
    } else {
      console.error(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ Script error:`, error.message);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  preloadMatches().catch(console.error);
}

module.exports = { preloadMatches };
