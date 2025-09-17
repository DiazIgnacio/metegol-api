#!/usr/bin/env node

/**
 * Script para forzar la población del 27 de septiembre usando la API externa directamente
 */

const https = require("https");

async function forcePopulate27Sep() {
  console.log("🔥 FORZANDO población del 27 de septiembre...");
  console.log("⚽ Buscando: Rosario Central vs Vélez y otros partidos");

  const FOOTBALL_API_KEY = "f2369093fd726cea4829cbc73d5c1d9f";

  // Hacer request directo a la API externa
  console.log("\n1. 📡 Consultando API externa directamente...");

  const options = {
    hostname: "v3.football.api-sports.io",
    port: 443,
    path: "/fixtures?league=128&season=2025&date=2025-09-27",
    method: "GET",
    headers: {
      "X-RapidAPI-Key": FOOTBALL_API_KEY,
      "X-RapidAPI-Host": "v3.football.api-sports.io",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);

          if (jsonData.errors && jsonData.errors.length > 0) {
            console.error("❌ Error en API externa:", jsonData.errors);
            reject(new Error("API external error"));
            return;
          }

          const matches = jsonData.response || [];
          console.log(`✅ API externa devolvió: ${matches.length} partidos`);

          if (matches.length > 0) {
            console.log("\n🏆 Partidos encontrados:");
            matches.forEach((match, index) => {
              const homeTeam = match.teams.home.name;
              const awayTeam = match.teams.away.name;
              const date = new Date(match.fixture.date).toLocaleString("es-AR");
              console.log(`   ${index + 1}. ${homeTeam} vs ${awayTeam}`);
              console.log(`      📅 ${date}`);
              console.log(
                `      🏟️  ${match.fixture.venue?.name || "Sede por confirmar"}`
              );
              console.log(`      🆔 ID: ${match.fixture.id}`);

              // Buscar específicamente Rosario Central
              if (
                homeTeam.includes("Rosario Central") ||
                awayTeam.includes("Rosario Central")
              ) {
                console.log(
                  `      🎯 ¡ENCONTRADO! Este es el partido que buscabas`
                );
              }
            });

            console.log("\n💡 PROBLEMA IDENTIFICADO:");
            console.log("   - La API externa SÍ tiene los datos");
            console.log(
              "   - Nuestro sistema NO los está obteniendo/guardando automáticamente"
            );
            console.log(
              "   - Necesitamos forzar que el sistema obtenga estos datos"
            );

            console.log("\n📋 ACCIONES RECOMENDADAS:");
            console.log(
              "   1. El sistema de caché funciona solo para datos ya guardados"
            );
            console.log(
              "   2. Necesitamos activar el fallback a la API externa"
            );
            console.log(
              "   3. O ejecutar un script que fuerce la sincronización"
            );
          } else {
            console.log("⚪ No se encontraron partidos en la API externa");
          }

          resolve(matches);
        } catch (error) {
          console.error("❌ Error parseando respuesta:", error);
          reject(error);
        }
      });
    });

    req.on("error", error => {
      console.error("❌ Error en request:", error);
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

forcePopulate27Sep()
  .then(() => {
    console.log("\n✅ Análisis completado");
  })
  .catch(error => {
    console.error("\n❌ Error:", error.message);
  });
