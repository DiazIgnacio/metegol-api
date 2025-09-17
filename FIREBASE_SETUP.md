# Firebase Integration Setup

Este documento explica cómo configurar Firebase para el cache de datos de la API Football.

## ¿Por qué Firebase Cache?

La integración con Firebase permite:

- **Reducir requests a la API Football**: Cachear datos por tiempo determinado
- **Mejorar performance**: Respuestas más rápidas al usuario
- **Optimizar costos**: Menos llamadas a la API paga
- **Escalabilidad**: Firebase maneja automáticamente la distribución

## 1. Configuración de Firebase

### Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Firestore Database en modo "production" o "test"

### Obtener configuración del proyecto

En la configuración del proyecto, obtén:

- **Web API Key**
- **Project ID**
- **Auth Domain**
- **Storage Bucket**
- **Messaging Sender ID**
- **App ID**

### Configurar Service Account (para servidor)

1. Ve a "Project Settings" > "Service Accounts"
2. Genera una nueva clave privada (JSON)
3. Guarda el archivo JSON de forma segura

## 2. Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
# Firebase Web Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----"

# Opcional: JSON completo del service account
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Para cron jobs (opcional)
CRON_SECRET=tu_secreto_para_cron_jobs
```

## 3. Estructura del Cache

### Colección en Firestore

Los datos se guardan en la colección `api_cache` con esta estructura:

```typescript
{
  data: any,           // Los datos cacheados
  timestamp: number,   // Timestamp de creación
  ttl: number,        // Time To Live en milisegundos
  key: string         // Clave única del cache
}
```

### TTL (Time To Live) por tipo de dato

- **Partidos en vivo**: 5 minutos
- **Partidos próximos**: 15 minutos
- **Partidos finalizados**: 3 horas
- **Datos de equipos**: 24 horas
- **Ligas**: 48 horas
- **Posiciones**: 1 hora
- **Estadísticas/Lineups**: 3 horas

## 4. Endpoints de Cache

### GET /api/cache

Administrar el cache:

```bash
# Obtener estadísticas
GET /api/cache?action=stats

# Limpiar cache expirado
GET /api/cache?action=clear-expired
```

### DELETE /api/cache

Refrescar cache específico:

```bash
# Refrescar fixtures de una liga
DELETE /api/cache?endpoint=fixtures&leagueId=128&from=2024-01-15&to=2024-01-15

# Refrescar equipos
DELETE /api/cache?endpoint=teams&search=all
```

### POST /api/cron/refresh-cache

Job automático para refrescar cache:

```bash
# Trigger manual
POST /api/cron/refresh-cache

# Con autenticación (recomendado)
POST /api/cron/refresh-cache
Authorization: Bearer tu_cron_secret
```

## 5. Configuración de Cron Jobs

### Vercel Cron

Si usas Vercel, crea `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-cache",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Cron externo

Programa una tarea cada 15 minutos:

```bash
*/15 * * * * curl -X POST https://tu-domain.com/api/cron/refresh-cache \
  -H "Authorization: Bearer tu_cron_secret"
```

## 6. Monitoreo

### Panel de Administración

Visita `/admin/cache` para:

- Ver estadísticas del cache
- Limpiar entradas expiradas
- Triggear refresh manual
- Monitorear tamaño y salud del cache

### Logs de Console

El sistema registra en console:

- ✅ Cache HIT: Cuando se usa cache
- 💾 Cache SET: Cuando se guarda en cache
- 🌐 API REQUEST: Cuando se hace request a la API
- 🔄 Cache refreshed: Cuando se refresca cache
- 🧹 Cleared expired: Cuando se limpia cache expirado

## 7. Seguridad

### Reglas de Firestore

Configura reglas restrictivas en Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo permitir acceso desde el servidor
    match /api_cache/{document} {
      allow read, write: if false; // Bloquear acceso directo
    }
  }
}
```

### Variables Sensibles

- Nunca commits las claves privadas al repositorio
- Usa `.env.local` para desarrollo
- Configura variables de entorno en producción de forma segura

## 8. Beneficios Implementados

### Antes (sin cache)

- Cada request del usuario = 1 llamada a API Football
- Múltiples usuarios = múltiples requests duplicados
- Costo alto en API calls
- Latencia de respuesta alta

### Después (con Firebase cache)

- Datos cacheados por TTL inteligente
- Múltiples usuarios comparten el mismo cache
- Reducción del 80-90% en API calls
- Respuestas instantáneas desde cache
- Refresh automático en segundo plano

## 9. Troubleshooting

### Error: Firebase Admin not initialized

- Verifica las variables de entorno del Service Account
- Asegúrate que FIREBASE_PRIVATE_KEY tiene los saltos de línea correctos

### Error: Permission denied

- Revisa las reglas de Firestore
- Verifica que el Service Account tiene permisos

### Cache no se actualiza

- Verifica que el cron job esté funcionando
- Revisa los logs en `/admin/cache`
- Triggea refresh manual

### Alto uso de memoria

- Implementa limpieza automática de cache expirado
- Ajusta los TTL según tus necesidades
- Monitorea el tamaño del cache regularmente
