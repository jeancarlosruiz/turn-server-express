# TURN Server with Express API

Un servidor TURN/STUN completo usando coturn con una API REST en Express y TypeScript, listo para desplegar en Render.

## Características

- **Servidor TURN/STUN** usando coturn para relay de conexiones WebRTC
- **API REST** en Express con TypeScript para obtener credenciales
- **Autenticación temporal** con HMAC-SHA1
- **Soporte UDP, TCP y TLS** para máxima compatibilidad
- **Docker** configurado y listo para producción
- **Render.yaml** incluido para deployment automático

## Estructura del Proyecto

```
turn-server-express/
├── src/
│   ├── controllers/
│   │   └── turn.controller.ts    # Controladores para endpoints
│   ├── routes/
│   │   └── turn.routes.ts        # Rutas de la API
│   ├── types/
│   │   └── turn.types.ts         # Definiciones de tipos
│   ├── utils/
│   │   └── turnAuth.ts           # Servicio de autenticación TURN
│   └── index.ts                  # Punto de entrada de la aplicación
├── turnserver.conf               # Configuración de coturn
├── start.sh                      # Script de inicio
├── Dockerfile                    # Configuración Docker
├── render.yaml                   # Configuración para Render
└── package.json
```

## Endpoints de la API

### GET /health
Health check del servidor

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### GET /api/turn/credentials
Obtiene credenciales temporales para el servidor TURN

**Query Parameters:**
- `ttl` (opcional): Tiempo de vida en segundos (default: 86400, max: 86400)

**Respuesta:**
```json
{
  "success": true,
  "credentials": {
    "username": "1704067200:turnuser",
    "credential": "base64encodedpassword==",
    "ttl": 86400,
    "urls": [
      "turn:your-server.com:3478?transport=udp",
      "turn:your-server.com:3478?transport=tcp",
      "turns:your-server.com:5349?transport=tcp"
    ]
  }
}
```

### GET /api/turn/config
Obtiene la configuración del servidor TURN

**Respuesta:**
```json
{
  "success": true,
  "config": {
    "realm": "turn.example.com",
    "port": 3478,
    "tlsPort": 5349,
    "externalIp": "123.45.67.89"
  }
}
```

## Instalación Local

### Prerrequisitos
- Node.js 18+
- Docker (opcional)

### Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repo>
cd turn-server-express

# Construir la imagen
docker build -t turn-server .

# Ejecutar el contenedor
docker run -p 3000:3000 -p 3478:3478 -p 3478:3478/udp -p 5349:5349 \
  -e TURN_STATIC_AUTH_SECRET=your-secret-key \
  -e TURN_REALM=turn.example.com \
  turn-server
```

### Sin Docker

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores
nano .env

# Modo desarrollo
npm run dev

# Compilar y ejecutar en producción
npm run build
npm start
```

## Deployment en Render

### Opción 1: Usando render.yaml (Recomendado)

1. Crea un repositorio en GitHub con este código
2. Ve a [Render Dashboard](https://dashboard.render.com/)
3. Click en "New" → "Blueprint"
4. Conecta tu repositorio de GitHub
5. Render detectará automáticamente el `render.yaml`
6. Configura las variables de entorno:
   - `TURN_REALM`: Tu dominio (ej: turn.yourdomain.com)
   - `TURN_STATIC_AUTH_SECRET`: Se generará automáticamente (o usa uno personalizado)
   - `EXTERNAL_IP`: (Opcional) Render lo detectará automáticamente
7. Click en "Apply" y espera el deployment

### Opción 2: Manual

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: turn-server-express
   - **Runtime**: Docker
   - **Region**: Oregon (o tu preferencia)
   - **Branch**: main
   - **Dockerfile Path**: ./Dockerfile
5. Agrega las variables de entorno:
   ```
   NODE_ENV=production
   PORT=3000
   TURN_PORT=3478
   TURN_TLS_PORT=5349
   TURN_REALM=turn.yourdomain.com
   TURN_STATIC_AUTH_SECRET=<genera-un-secreto-seguro>
   ```
6. Click en "Create Web Service"

### Variables de Entorno Importantes

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `TURN_STATIC_AUTH_SECRET` | Secreto para autenticación HMAC | - | Sí |
| `TURN_REALM` | Dominio del servidor TURN | turn.example.com | Sí |
| `PORT` | Puerto de la API Express | 3000 | No |
| `TURN_PORT` | Puerto del servidor TURN | 3478 | No |
| `TURN_TLS_PORT` | Puerto TLS del servidor TURN | 5349 | No |
| `EXTERNAL_IP` | IP pública del servidor | Auto-detectada | No |

### Nota sobre Puertos en Render

Render solo expone el puerto HTTP/HTTPS por defecto. Para que el servidor TURN funcione correctamente con UDP y puertos adicionales, necesitarás:

1. **Plan Render con soporte UDP**: Contacta con Render para habilitar puertos UDP
2. **Alternativa**: Usar un servidor TURN separado en un VPS (DigitalOcean, AWS, etc.) y solo la API en Render

## Uso con WebRTC

### JavaScript/TypeScript

```javascript
// Obtener credenciales del servidor
const response = await fetch('https://tu-servidor.onrender.com/api/turn/credentials');
const { credentials } = await response.json();

// Configurar RTCPeerConnection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: credentials.urls,
      username: credentials.username,
      credential: credentials.credential
    }
  ]
});
```

### React Example

```jsx
import { useEffect, useState } from 'react';

function useWebRTC() {
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const setupConnection = async () => {
      // Obtener credenciales TURN
      const response = await fetch('https://tu-servidor.onrender.com/api/turn/credentials');
      const { credentials } = await response.json();

      // Crear peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: credentials.urls,
            username: credentials.username,
            credential: credentials.credential
          }
        ]
      });

      setPeerConnection(pc);
    };

    setupConnection();
  }, []);

  return peerConnection;
}
```

## Solución de Problemas de Firewall

El servidor TURN resuelve problemas comunes de conectividad:

- **Symmetric NAT**: El servidor relay permite conexiones entre peers detrás de NAT simétrico
- **Firewalls restrictivos**: Usa TCP y TLS como alternativa a UDP
- **Bloqueo de puertos**: El puerto 443 (TURNS) generalmente no está bloqueado

### Verificar Conectividad

1. **Test de STUN/TURN**: Usa herramientas como [Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
2. **Logs del servidor**: Revisa los logs en Render Dashboard
3. **Chrome WebRTC Internals**: `chrome://webrtc-internals/`

## Seguridad

- Usa HTTPS en producción
- Cambia `TURN_STATIC_AUTH_SECRET` a un valor seguro y aleatorio
- Implementa rate limiting si es necesario
- Considera agregar autenticación a la API si es pública

## Licencia

MIT

## Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue o pull request.

## Recursos

- [coturn GitHub](https://github.com/coturn/coturn)
- [WebRTC Documentation](https://webrtc.org/)
- [Render Documentation](https://render.com/docs)
