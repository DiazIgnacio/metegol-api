# Test de Lineups - Debug

## Problema Actual

Estás viendo estos logs:

```
✅ Cache HIT for lineups_{"awayId":"1945","fixtureId":"1331538","homeId":"1936"}
🌐 SMART API CALL: Cache expired - needs refresh - Fetching lineups for match 1331538 (call #2)
💾 Cache SET for lineups_{"awayId":"1946","fixtureId":"1331534","homeId":"1067"} (TTL: 180m)
```

## Diagnóstico

El log `💾 Cache SET for lineups_... (TTL: 180m)` indica que está usando el cache básico (180 min) en lugar del inteligente (43200 min = 30 días).

## Prueba para Verificar

```bash
# Primera llamada (debería hacer API call)
curl "http://localhost:3000/api/lineups?fixture=TEST123&home=1&away=2"

# Segunda llamada IGUAL (debería usar cache permanente)
curl "http://localhost:3000/api/lineups?fixture=TEST123&home=1&away=2"

# Lo que DEBERÍAS ver:
# Primera: "🌐 SMART API CALL: No data in cache - Fetching lineups"
# Segunda: "🎯 SMART CACHE: Lineups cached permanently - using existing data"
```

## Logs Esperados vs Actuales

### ❌ **Actual (malo)**:

```
💾 Cache SET for lineups_... (TTL: 180m)  ← Está usando cache básico
```

### ✅ **Esperado (bueno)**:

```
💾 Cache SET for lineups_... (TTL: 43200m)  ← Debería usar cache permanente
🎯 SMART CACHE: Lineups cached permanently - using existing data  ← En requests siguientes
```

## Posibles Causas

1. **Instancia incorrecta**: Puede estar usando `FootballApiCached` en lugar de `SmartFootballApi`
2. **Cache path**: El método no está pasando por la lógica inteligente
3. **Herencia**: Hay un problema en la cadena de herencia

## Verificación

Busca en los logs:

- ✅ Si ves: `🎯 SMART CACHE: Lineups cached permanently` = Funciona
- ❌ Si ves: `💾 Cache SET ... (TTL: 180m)` = No funciona
