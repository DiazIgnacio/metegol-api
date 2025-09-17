# 🚀 Sistema de Población Masiva de Firebase

## 📋 **Resumen del Sistema Creado**

Hemos creado un sistema completo de población automatizada que puede:

1. **Poblar Firebase con datos de múltiples ligas**
2. **Ejecutar población continua automática**
3. **Respetar rate limits de la API**
4. **Priorizar ligas importantes**
5. **Funcionar en background**

---

## 🛠️ **Componentes del Sistema**

### 1. **MassiveDataPopulator** (`lib/background-sync/MassiveDataPopulator.ts`)

- **30+ ligas** incluidas (Europa, Sudamérica, Internacional)
- **Priorización inteligente**: High → Medium → Low
- **Batch processing** para evitar sobrecarga
- **Rate limiting** automático (6s entre calls)

#### Ligas Incluidas:

```typescript
// HIGH PRIORITY
- Liga Profesional Argentina (128)
- Primera Nacional Argentina (129)
- Copa Argentina (130)
- Brasileirão Serie A (71)
- Champions League (2)
- Premier League (39)
- La Liga (140)
- Serie A (135)
- Bundesliga (78)
- Ligue 1 (61)

// MEDIUM PRIORITY
- Copa Libertadores (13)
- Copa Sudamericana (11)
- Europa League (3)
- Conference League (848)
- Eredivisie (88)
- Primeira Liga (94)

// LOW PRIORITY
- A-League, Chinese Super League, etc.
```

### 2. **AutoScheduler** (`lib/background-sync/AutoScheduler.ts`)

- **Población automática** cada cierto tiempo
- **Ventanas de actividad** (horarios de baja/alta actividad)
- **Health checks** y auto-recovery
- **Throttling inteligente**

#### Configuración por defecto:

```typescript
intervals: {
  quickSync: 30,      // minutos
  smartSync: 120,     // minutos
  fullPopulation: 1440 // minutos (24h)
}
timeWindows: {
  lowActivity: { start: 2, end: 6 },    // 2-6 AM
  highActivity: { start: 14, end: 22 }  // 2-10 PM
}
```

### 3. **APIs de Control**

#### **Population Control** (`/api/admin/populate`)

```bash
# Quick population (ligas esenciales, 7 días)
curl -X POST /api/admin/populate \
  -H "Cookie: admin-token=..." \
  -d '{"action": "start_quick"}'

# Full population (todas las ligas, 60 días)
curl -X POST /api/admin/populate \
  -H "Cookie: admin-token=..." \
  -d '{"action": "start_full"}'

# Custom population
curl -X POST /api/admin/populate \
  -H "Cookie: admin-token=..." \
  -d '{"action": "start_massive", "config": {...}}'

# Status
curl /api/admin/populate -H "Cookie: admin-token=..."
```

#### **Scheduler Control** (`/api/admin/scheduler`)

```bash
# Start auto scheduler
curl -X POST /api/admin/scheduler \
  -H "Cookie: admin-token=..." \
  -d '{"action": "start"}'

# Update config
curl -X POST /api/admin/scheduler \
  -H "Cookie: admin-token=..." \
  -d '{"action": "update_config", "config": {...}}'

# Status
curl /api/admin/scheduler -H "Cookie: admin-token=..."
```

### 4. **Scripts Standalone**

#### **Population Script** (`scripts/massive-populate.js`)

```bash
# Quick mode (ligas esenciales)
node scripts/massive-populate.js quick

# Full mode (todas las ligas)
node scripts/massive-populate.js full

# Custom mode
node scripts/massive-populate.js custom 30 7 5 30000 300
#                                      ↑  ↑ ↑ ↑     ↑
#                                      │  │ │ │     maxCalls/hour
#                                      │  │ │ delay(ms)
#                                      │  │ batchSize
#                                      │  futureDays
#                                      pastDays
```

---

## 🚀 **Cómo Usar el Sistema**

### **Opción 1: Población Rápida (Recomendada)**

```bash
curl -X POST http://localhost:3005/api/admin/populate \
  -H "Cookie: admin-token=TU_TOKEN" \
  -d '{"action": "start_quick"}'
```

### **Opción 2: Scheduler Automático**

```bash
# Activar scheduler
curl -X POST http://localhost:3005/api/admin/scheduler \
  -H "Cookie: admin-token=TU_TOKEN" \
  -d '{"action": "start"}'
```

### **Opción 3: Script Standalone**

```bash
node scripts/massive-populate.js quick
```

---

## 📊 **Monitoreo del Progreso**

### **Ver Stats de Población**

```bash
curl http://localhost:3005/api/admin/populate \
  -H "Cookie: admin-token=TU_TOKEN"
```

**Respuesta ejemplo:**

```json
{
  "stats": {
    "totalBatches": 10,
    "completedBatches": 3,
    "progress": 30,
    "totalApiCalls": 45,
    "isRunning": true,
    "apiCallsPerHour": 150
  }
}
```

### **Ver Status del Scheduler**

```bash
curl http://localhost:3005/api/admin/scheduler \
  -H "Cookie: admin-token=TU_TOKEN"
```

---

## ⚙️ **Configuración Personalizada**

### **Custom Population Config**

```json
{
  "action": "start_massive",
  "config": {
    "leagues": [
      {
        "id": 128,
        "name": "Liga Argentina",
        "priority": "high",
        "region": "South America"
      }
    ],
    "dateRange": {
      "pastDays": 30,
      "futureDays": 7
    },
    "throttling": {
      "batchSize": 5,
      "delayBetweenBatches": 30000,
      "maxApiCallsPerHour": 300
    }
  }
}
```

### **Custom Scheduler Config**

```json
{
  "action": "update_config",
  "config": {
    "enabled": true,
    "intervals": {
      "quickSync": 30,
      "smartSync": 120,
      "fullPopulation": 1440
    },
    "timeWindows": {
      "lowActivity": { "start": 2, "end": 6 },
      "highActivity": { "start": 14, "end": 22 }
    }
  }
}
```

---

## 🎯 **Resultados Esperados**

Después de ejecutar la población:

- ✅ **30+ ligas** con datos completos
- ✅ **60+ días** de histórico (full mode)
- ✅ **Miles de partidos** con stats, events, lineups
- ✅ **Cache optimizado** con TTL dinámico
- ✅ **API calls eficientes** respetando rate limits

---

## 🔧 **Solución de Problemas**

### **Si la población falla:**

```bash
# Stop current operation
curl -X POST /api/admin/populate \
  -d '{"action": "stop"}'

# Check status
curl /api/admin/populate
```

### **Si el scheduler no funciona:**

```bash
# Restart scheduler
curl -X POST /api/admin/scheduler \
  -d '{"action": "restart"}'
```

### **Logs en el servidor:**

Filtra logs con: `MASSIVE POPULATION`, `BATCH`, `LEAGUE`

---

## 🎉 **¡Sistema Completo y Funcionando!**

El sistema está diseñado para:

- **Poblar Firebase gradualmente** sin sobrecargar la API
- **Mantener datos actualizados** automáticamente
- **Escalar a cualquier número de ligas**
- **Funcionar 24/7** con minimal intervención

**¡Ahora tienes un sistema robusto de población de datos que puede manejar cientos de ligas y miles de partidos!** 🚀
