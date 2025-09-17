# Sistema de Precarga de Partidos Futuros

Este sistema resuelve el problema de datos vacíos cuando los usuarios navegan a fechas futuras, implementando:

1. **Precarga automática** de partidos futuros
2. **Carga bajo demanda** cuando no hay datos
3. **Jobs automáticos** para mantener datos actualizados

## 🚀 Funcionalidades

### 1. Precarga Automática

- **Endpoint**: `POST /api/preload`
- **Cron Job**: Ejecuta diariamente a las 2:00 AM
- **Alcance**: Próximos 14 días por defecto
- **Ligas**: Ligas principales configuradas

### 2. Carga Bajo Demanda

- **Endpoint**: `POST /api/load-on-demand`
- **Activación**: Automática cuando no hay datos
- **Inteligente**: Solo carga datos faltantes

### 3. Verificación de Datos

- **Endpoint**: `GET /api/load-on-demand`
- **Función**: Verifica disponibilidad de datos
- **Respuesta**: Estado detallado por liga y fecha

## 📋 APIs Disponibles

### Precarga Automática

```bash
# Precargar próximos 14 días (ligas por defecto)
curl -X POST http://localhost:3000/api/preload

# Precargar días específicos
curl -X POST http://localhost:3000/api/preload \
  -H "Content-Type: application/json" \
  -d '{"days": 7, "leagues": [128, 129, 130]}'

# Ver estado de precarga
curl http://localhost:3000/api/preload?action=status
```

### Carga Bajo Demanda

```bash
# Cargar datos para fecha específica
curl -X POST http://localhost:3000/api/load-on-demand \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-25"}'

# Cargar datos para ligas específicas
curl -X POST http://localhost:3000/api/load-on-demand \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-25", "leagues": [128, 2, 3]}'

# Verificar datos disponibles
curl "http://localhost:3000/api/load-on-demand?date=2024-12-25"

# Verificar ligas específicas
curl "http://localhost:3000/api/load-on-demand?date=2024-12-25&leagues=128,129,130"
```

### Cron Job Manual

```bash
# Ejecutar job de precarga manualmente
curl http://localhost:3000/api/cron/preload

# Forzar precarga (sobrescribir datos existentes)
curl -X POST http://localhost:3000/api/cron/preload \
  -H "Content-Type: application/json" \
  -d '{"days": 7, "force": true}'
```

## 🔧 Scripts de Utilidad

### Precarga Manual

```bash
# Precargar próximos 14 días
node scripts/preload-future-matches.js

# Precargar días específicos
node scripts/preload-future-matches.js 7

# Precargar ligas específicas
node scripts/preload-future-matches.js 14 "128,129,130,2,3"
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Requeridas
FOOTBALL_API_KEY=tu_api_key_aqui

# Opcionales
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=tu_secreto_para_cron_en_produccion
```

### Ligas por Defecto

```javascript
const DEFAULT_LEAGUES = [
  128, // Liga Profesional de Futbol
  129, // Primera Nacional
  130, // Copa Argentina
  2, // Champions League
  3, // Europa League
  848, // Conference League
  15, // Mundial Clubes
];
```

### Horarios de Cron Job

```json
{
  "crons": [
    {
      "path": "/api/cron/preload",
      "schedule": "0 2 * * *" // Diario a las 2:00 AM
    }
  ]
}
```

## 🔄 Flujo de Funcionamiento

### 1. Navegación del Usuario

```
Usuario selecciona fecha futura
        ↓
Dashboard llama a FootballApi.getMatches()
        ↓
Si no hay datos → loadOnDemand()
        ↓
Sistema carga datos faltantes
        ↓
Datos mostrados al usuario
```

### 2. Precarga Automática

```
Cron Job (2:00 AM diario)
        ↓
Verifica datos existentes
        ↓
Carga próximos 14 días
        ↓
Solo ligas principales
        ↓
Respeta límites de API
```

### 3. Carga Bajo Demanda

```
Cliente solicita fecha específica
        ↓
Verifica datos en Firebase
        ↓
Si faltan datos → fetch API externa
        ↓
Guarda en Firebase con TTL apropiado
        ↓
Retorna datos completos
```

## 📊 TTL (Time To Live) Inteligente

### Fixtures (Partidos)

- **Pasados**: 30 días
- **Finalizados (hoy)**: 24 horas
- **En vivo**: 5 minutos
- **Futuros**: 2 horas

### Detalles (Stats/Events)

- **En vivo**: 5 minutos
- **Finalizados**: 24 horas
- **Por defecto**: 1 hora

### Lineups

- **Siempre**: 30 días (datos estáticos)

## 🚦 Manejo de Límites de API

### Rate Limiting

- **Máximo**: 10 requests/minuto
- **Delay**: 6 segundos entre requests
- **Batch processing**: Procesa en lotes

### Daily Limits

- **Total**: 7,500 requests/día
- **Monitoreo**: Automático
- **Parada**: Si > 90% de uso

## 🔍 Monitoreo y Logs

### Logs de Precarga

```bash
🚀 Starting automated preload job...
✅ Preloaded league 128 for 2024-12-25
📊 Preload completed: 98/98 successful
```

### Logs de Carga Bajo Demanda

```bash
🔄 No data found for 2024-12-25, trying load on demand...
📥 Loading missing data for 3 leagues
✅ Loaded 15 matches on demand
```

### Estados de Response

```javascript
{
  "success": true,
  "message": "Precarga completada: 95/98 exitosas",
  "stats": {
    "successful": 95,
    "failed": 3,
    "total": 98,
    "days": 14,
    "leagues": 7
  }
}
```

## 🛠️ Troubleshooting

### Problema: No se cargan datos futuros

**Solución**: Ejecutar precarga manual

```bash
curl -X POST http://localhost:3000/api/preload
```

### Problema: Datos obsoletos

**Solución**: Forzar recarga

```bash
node scripts/preload-future-matches.js 7
```

### Problema: API limits excedidos

**Verificar**: Estado de límites

```bash
curl http://localhost:3000/api/preload?action=status
```

### Problema: Cron job no funciona

**Verificar**:

1. Variable `CRON_SECRET` en producción
2. Logs de Vercel/servidor
3. Configuración en `vercel.json`

## 🎯 Casos de Uso

### 1. Lanzamiento de Aplicación

```bash
# Precarga inicial completa
node scripts/preload-future-matches.js 30
```

### 2. Mantenimiento Semanal

```bash
# El cron job automático se encarga
# Backup manual si es necesario:
curl -X POST http://localhost:3000/api/cron/preload
```

### 3. Eventos Especiales

```bash
# Cargar copa mundial (liga 15) para próximo mes
node scripts/preload-future-matches.js 30 "15"
```

### 4. Testing/Development

```bash
# Verificar sistema sin consumir API
curl "http://localhost:3000/api/load-on-demand?date=2024-12-25"
```

## 🔒 Seguridad

### Producción

- Cron jobs requieren `CRON_SECRET`
- APIs públicas tienen rate limiting
- Logs no exponen API keys

### Desarrollo

- APIs disponibles sin autenticación
- Logs detallados para debugging
- Scripts manuales disponibles

Este sistema garantiza que los usuarios siempre vean datos de partidos, sin importar qué fecha naveguen, manteniendo la aplicación rápida y actualizada.
