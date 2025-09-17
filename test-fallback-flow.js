#!/usr/bin/env node

/**
 * Test completo del flujo de fallback
 */

const http = require("http");

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
    };

    const req = http.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
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

async function testFallbackFlow() {
  console.log("🧪 TEST COMPLETO DEL FLUJO DE FALLBACK");
  console.log("=====================================\n");

  const testUrl =
    "http://localhost:3006/api/fixtures?date=2025-09-27&league=128";

  try {
    console.log("🔍 1. PRIMER REQUEST - Debería activar fallback...");
    console.log(`URL: ${testUrl}`);

    const response1 = await makeRequest(testUrl);

    console.log(`Status: ${response1.statusCode}`);

    if (response1.statusCode === 200) {
      if (typeof response1.data === "object" && response1.data.matches) {
        console.log(`✅ Matches encontrados: ${response1.data.matches.length}`);

        if (response1.data.matches.length > 0) {
          console.log("📋 Primeros partidos:");
          response1.data.matches.slice(0, 3).forEach((match, i) => {
            console.log(
              `   ${i + 1}. ${match.teams.home.name} vs ${match.teams.away.name}`
            );
            console.log(`      📅 ${match.fixture.date}`);
            console.log(`      🏟️  ${match.fixture.venue?.name || "N/A"}`);
            console.log(
              `      🔸 Estado: ${match.fixture.status.short} (${match.fixture.status.long})`
            );
          });

          // Verificar si hay Rosario Central
          const rosarioMatch = response1.data.matches.find(
            m =>
              m.teams.home.name.includes("Rosario Central") ||
              m.teams.away.name.includes("Rosario Central")
          );

          if (rosarioMatch) {
            console.log(`\n🎯 ¡ROSARIO CENTRAL ENCONTRADO!`);
            console.log(
              `   ${rosarioMatch.teams.home.name} vs ${rosarioMatch.teams.away.name}`
            );
          } else {
            console.log(
              `\n⚠️  Rosario Central no encontrado en los resultados`
            );
          }
        } else {
          console.log("❌ Response tiene estructura correcta pero 0 matches");
        }
      } else {
        console.log("❌ Response no tiene estructura esperada");
        console.log("Data recibida:", JSON.stringify(response1.data, null, 2));
      }
    } else {
      console.log(`❌ Status code: ${response1.statusCode}`);
      console.log("Response:", response1.data);
    }

    console.log("\n⏱️ Esperando 3 segundos antes del segundo request...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\n🔍 2. SEGUNDO REQUEST - Debería usar cache...");
    const response2 = await makeRequest(testUrl);

    console.log(`Status: ${response2.statusCode}`);
    if (response2.statusCode === 200 && response2.data.matches) {
      console.log(`✅ Matches en cache: ${response2.data.matches.length}`);

      // Comparar si son iguales
      if (response1.data.matches && response2.data.matches) {
        const sameCount =
          response1.data.matches.length === response2.data.matches.length;
        console.log(`🔄 Misma cantidad de matches: ${sameCount ? "✅" : "❌"}`);
      }
    }
  } catch (error) {
    console.error("💥 Error en test:", error.message);
  }
}

testFallbackFlow();
