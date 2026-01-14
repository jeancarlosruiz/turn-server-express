# Variables de Entorno - Guía Completa

## Variables Requeridas

### 1. TURN_STATIC_AUTH_SECRET
**Descripción**: Secreto usado para generar credenciales temporales con HMAC-SHA1.

**Generación**: Debe ser una cadena aleatoria y segura de al menos 32 caracteres.

**Cómo generarla**:

**Opción 1 - Linux/Mac (Terminal)**:
```bash
openssl rand -hex 32
# Resultado ejemplo: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**Opción 2 - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción 3 - Python**:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Opción 4 - Online (no recomendado para producción)**:
Visita: https://generate-secret.vercel.app/32

**Valor de ejemplo**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

---

### 2. TURN_REALM
**Descripción**: Dominio del servidor TURN. Debe coincidir con tu dominio público.

**Valor**: Tu dominio o subdominio donde estará desplegado el servidor.

**Ejemplos**:
- `turn.midominio.com`
- `webrtc.example.com`
- `tu-app.onrender.com` (si usas Render)

**Cómo obtenerlo**:
- Si usas Render: Lo obtienes después del primer deploy (ej: `mi-turn-server.onrender.com`)
- Si tienes dominio propio: Crea un registro DNS A o CNAME apuntando a tu servidor

**Valor para testing**: `turn.example.com`

---

## Variables Opcionales

### 3. PORT
**Descripción**: Puerto donde corre la API Express.

**Default**: `3000`

**Valor recomendado en Render**: `3000` (Render lo maneja automáticamente)

---

### 4. TURN_PORT
**Descripción**: Puerto del servidor TURN para UDP/TCP.

**Default**: `3478` (estándar TURN)

**Cambiar solo si**: Tienes conflictos de puertos o requisitos específicos.

---

### 5. TURN_TLS_PORT
**Descripción**: Puerto del servidor TURN para conexiones TLS/DTLS.

**Default**: `5349` (estándar TURNS)

**Cambiar solo si**: Tienes conflictos de puertos o requisitos específicos.

---

### 6. EXTERNAL_IP
**Descripción**: IP pública del servidor. Importante para NAT traversal.

**Default**: Auto-detectada mediante `https://api.ipify.org`

**Cuándo configurarla manualmente**:
- Si la auto-detección falla
- Si usas una IP estática específica

**Cómo obtenerla**:
```bash
curl https://api.ipify.org
# o
curl https://ifconfig.me
```

**En Render**: No es necesaria, se detecta automáticamente.

---

### 7. NODE_ENV
**Descripción**: Entorno de ejecución de Node.js.

**Valores posibles**: `development`, `production`, `test`

**Default en Render**: `production`

---

## Archivo .env para Desarrollo Local

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# TURN Server Configuration
TURN_STATIC_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
TURN_REALM=localhost
TURN_PORT=3478
TURN_TLS_PORT=5349

# External IP (opcional para desarrollo local)
EXTERNAL_IP=
```

---

## Configuración en Render

### Método 1: Usando render.yaml (Automático)

El archivo `render.yaml` ya incluye las variables. Solo necesitas configurar estas 2:

1. **Ve a tu servicio en Render Dashboard**
2. **Environment** → **Environment Variables**
3. **Configura**:

```
TURN_REALM = tu-app.onrender.com
TURN_STATIC_AUTH_SECRET = [genera con: openssl rand -hex 32]
```

Las demás se configuran automáticamente.

---

### Método 2: Configuración Manual Completa

Si creas el servicio manualmente, agrega estas variables:

```
NODE_ENV = production
PORT = 3000
TURN_PORT = 3478
TURN_TLS_PORT = 5349
TURN_REALM = tu-app.onrender.com
TURN_STATIC_AUTH_SECRET = [tu-secreto-generado]
EXTERNAL_IP = [dejar vacío para auto-detección]
```

---

## Script de Generación Rápida

He creado un script que genera todas las variables por ti:

```bash
cd turn-server-express
node generate-env.js
```

Este script:
1. Genera un `TURN_STATIC_AUTH_SECRET` seguro
2. Detecta tu IP pública
3. Crea un archivo `.env` con valores por defecto
4. Muestra las variables listas para copiar en Render

---

## Validación de Variables

Después de configurar, verifica que todo esté correcto:

### Desarrollo Local:
```bash
npm run dev
```

Deberías ver:
```
🚀 Server is running on port 3000
📍 Environment: development
🔄 TURN server port: 3478
🔒 TURN TLS port: 5349
```

### Producción (Render):
Visita: `https://tu-app.onrender.com/api/turn/config`

Deberías ver:
```json
{
  "success": true,
  "config": {
    "realm": "tu-app.onrender.com",
    "port": 3478,
    "tlsPort": 5349,
    "externalIp": "123.45.67.89"
  }
}
```

---

## Resumen de Variables Mínimas

Para un deployment rápido en Render, solo necesitas **2 variables**:

| Variable | Valor | Cómo Obtenerlo |
|----------|-------|----------------|
| `TURN_REALM` | `tu-app.onrender.com` | Tu dominio de Render |
| `TURN_STATIC_AUTH_SECRET` | `a1b2c3...` | `openssl rand -hex 32` |

**Las demás tienen valores por defecto que funcionan perfectamente.**

---

## Seguridad

⚠️ **Importante**:

1. **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
2. **NUNCA** compartas tu `TURN_STATIC_AUTH_SECRET` públicamente
3. **Genera un nuevo secreto** para cada entorno (desarrollo, staging, producción)
4. **Rota el secreto** cada 3-6 meses por seguridad

---

## Troubleshooting

### Error: "TURN_STATIC_AUTH_SECRET is not defined"
**Solución**: Verifica que la variable esté configurada en Render o en tu `.env`

### Error: "Invalid credentials"
**Solución**: El secreto en el servidor Express debe coincidir con el de coturn

### Las conexiones no funcionan
**Solución**: Verifica que `TURN_REALM` sea accesible públicamente y que `EXTERNAL_IP` esté correcta
