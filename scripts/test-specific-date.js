#!/usr/bin/env node

/**
 * Script para probar una fecha específica - 27 de septiembre con Rosario Central vs Vélez
 */

const https = require("https");

const BASE_URL = "http://localhost:3006";

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
    };

    const req = require("http").request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function testSpecificDate() {
  console.log("🔍 Probando fecha específica: 2025-09-27");
  console.log("⚽ Buscando: Rosario Central vs Vélez (y otros partidos)");

  try {
    // 1. Verificar estado actual
    console.log("\n📊 1. Verificando estado actual en cache...");
    const currentState = await makeRequest(
      `${BASE_URL}/api/fixtures?date=2025-09-27&league=128`
    );
    console.log(
      `   Partidos en cache: ${currentState.data.matches?.length || 0}`
    );

    // 2. Forzar carga con load-on-demand
    console.log("\n🔄 2. Forzando carga con load-on-demand...");
    const loadResult = await makeRequest(
      `${BASE_URL}/api/load-on-demand?date=2025-09-27&league=128`
    );
    console.log(`   Resultado: ${JSON.stringify(loadResult.data, null, 2)}`);

    // 3. Esperar un poco y verificar nuevamente
    console.log("\n⏳ 3. Esperando 5 segundos para que se procese...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("\n📊 4. Verificando nuevamente después de la carga...");
    const afterLoad = await makeRequest(
      `${BASE_URL}/api/fixtures?date=2025-09-27&league=128`
    );
    console.log(
      `   Partidos después de carga: ${afterLoad.data.matches?.length || 0}`
    );

    if (afterLoad.data.matches && afterLoad.data.matches.length > 0) {
      console.log("\n🎉 ¡ÉXITO! Partidos encontrados:");
      afterLoad.data.matches.forEach((match, index) => {
        console.log(
          `   ${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name}`
        );
        console.log(`      📅 ${match.fixture.date}`);
        console.log(
          `      🏟️  ${match.fixture.venue?.name || "Sede por confirmar"}`
        );
      });
    } else {
      console.log(
        "\n❌ Aún no se encontraron partidos. Puede necesitar más tiempo o hay un problema en el sistema."
      );
    }

    // 5. Probar también con múltiples ligas
    console.log("\n🔄 5. Probando con múltiples ligas...");
    const multiLeague = await makeRequest(
      `${BASE_URL}/api/fixtures?date=2025-09-27&leagues=128,129,130`
    );
    console.log(
      `   Partidos con múltiples ligas: ${multiLeague.data.matches?.length || 0}`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testSpecificDate();
