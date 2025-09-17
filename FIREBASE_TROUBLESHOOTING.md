# Firebase Cache - Troubleshooting

## 🎯 **Estado Actual**

✅ **La aplicación funciona perfectamente SIN cache**
✅ **Firebase está integrado y listo para usar**
❌ **Cache temporalmente deshabilitado por problemas de autenticación**

## 🔧 **Para Habilitar Firebase Cache**

### 1. **Verificar Firestore Database**

En [Firebase Console](https://console.firebase.google.com/project/capogol-79914):

1. Ve a **Firestore Database**
2. Asegúrate que está **habilitado**
3. Verifica las **reglas de seguridad**

**Reglas temporales para testing:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Solo para pruebas
    }
  }
}
```

### 2. **Verificar Service Account**

1. Ve a **Project Settings** > **Service Accounts**
2. Verifica que el email coincida: `firebase-adminsdk-g6j9o@capogol-79914.iam.gserviceaccount.com`
3. Si hay problemas, genera una nueva private key

### 3. **Habilitar Cache en el Código**

Una vez resuelto el problema de autenticación:

```bash
# En app/api/fixtures/route.ts cambiar:
import { FootballApiServer } from "@/lib/footballApi";
const api = new FootballApiServer(apiKey);

# Por:
import { FootballApiCached } from "@/lib/footballApiCached";
const api = new FootballApiCached(apiKey);
```

## 🧪 **Testing Firebase**

### Test básico de conexión:

```bash
curl http://localhost:3000/api/cache?action=stats
```

**Respuesta esperada:**

```json
{
  "success": true,
  "stats": { "totalEntries": 0, "expiredEntries": 0, "sizeBytes": 0 }
}
```

### Test de cache funcionando:

```bash
# Primera llamada (debe hacer API request)
curl "http://localhost:3000/api/fixtures?league=128"

# Segunda llamada (debe usar cache)
curl "http://localhost:3000/api/fixtures?league=128"
```

**En los logs deberías ver:**

```
🌐 API REQUEST: fixtures for league 128...  # Primera vez
✅ Cache HIT for fixtures_{"from":"..."}     # Segunda vez
```

## 🔄 **Implementación Gradual**

### Opción 1: Cache Opcional

Mantener ambas implementaciones y usar cache solo cuando funcione:

```typescript
// lib/footballApiSmart.ts
export function createFootballApi(apiKey: string) {
  try {
    // Intentar usar cache
    return new FootballApiCached(apiKey);
  } catch (error) {
    // Fallback a API normal
    return new FootballApiServer(apiKey);
  }
}
```

### Opción 2: Variable de Entorno

```bash
# .env.local
ENABLE_FIREBASE_CACHE=false  # cambiar a true cuando funcione
```

```typescript
const useCache = process.env.ENABLE_FIREBASE_CACHE === "true";
const api = useCache
  ? new FootballApiCached(apiKey)
  : new FootballApiServer(apiKey);
```

## 🚀 **Beneficios Una Vez Habilitado**

- **80-90% reducción** en API calls a Football API
- **Respuestas instantáneas** desde cache
- **Ahorro de costos** significativo
- **Mejor experiencia** de usuario

## 📊 **Monitoreo del Cache**

Una vez funcionando:

- **Panel Admin**: `http://localhost:3000/admin/cache`
- **API Stats**: `http://localhost:3000/api/cache?action=stats`
- **Refresh Manual**: `POST http://localhost:3000/api/cron/refresh-cache`

## 🐛 **Problemas Comunes**

### Error: UNAUTHENTICATED

- Verificar reglas de Firestore
- Regenerar service account key
- Revisar variables de entorno

### Error: Permission denied

- Verificar IAM permissions del service account
- Asegurar que tiene rol "Firebase Admin SDK Administrator Service Agent"

### Cache no se actualiza

- Verificar TTL settings
- Triggear refresh manual
- Revisar logs de errores

---

**💡 Tip:** El sistema funciona perfectamente sin cache. Firebase es una optimización, no un requisito.
