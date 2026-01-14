#!/usr/bin/env node

/**
 * Script para generar variables de entorno automáticamente
 * Uso: node generate-env.js
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔧 Generador de Variables de Entorno para TURN Server\n');

// Generar secreto seguro
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Obtener IP pública
const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Función principal
const main = async () => {
  try {
    // Generar secreto
    const secret = generateSecret();
    console.log('✅ Secreto generado correctamente');
    
    // Obtener IP pública
    let externalIP = '';
    try {
      externalIP = await getPublicIP();
      console.log(`✅ IP pública detectada: ${externalIP}`);
    } catch (error) {
      console.log('⚠️  No se pudo detectar la IP pública (opcional)');
    }
    
    // Crear contenido del .env
    const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# TURN Server Configuration
TURN_STATIC_AUTH_SECRET=${secret}
TURN_REALM=localhost
TURN_PORT=3478
TURN_TLS_PORT=5349

# External IP (detectada automáticamente)
EXTERNAL_IP=${externalIP}
`;

    // Guardar archivo .env
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('\n⚠️  El archivo .env ya existe. Creando .env.generated en su lugar...');
      fs.writeFileSync(path.join(__dirname, '.env.generated'), envContent);
      console.log('✅ Archivo .env.generated creado correctamente');
    } else {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Archivo .env creado correctamente');
    }
    
    // Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📋 VARIABLES GENERADAS');
    console.log('='.repeat(60));
    console.log(`
TURN_STATIC_AUTH_SECRET=${secret}
TURN_REALM=localhost
EXTERNAL_IP=${externalIP || 'auto-detectar'}
    `);
    
    console.log('='.repeat(60));
    console.log('🚀 PARA USAR EN RENDER (copia estas 2 variables):');
    console.log('='.repeat(60));
    console.log(`
TURN_STATIC_AUTH_SECRET
  ${secret}

TURN_REALM
  tu-app.onrender.com  (reemplaza con tu dominio de Render)
    `);
    
    console.log('='.repeat(60));
    console.log('📝 INSTRUCCIONES:');
    console.log('='.repeat(60));
    console.log(`
1. Para desarrollo local:
   - El archivo .env ya está listo
   - Ejecuta: npm install
   - Ejecuta: npm run dev

2. Para Render:
   - Ve a tu servicio → Environment → Environment Variables
   - Agrega TURN_STATIC_AUTH_SECRET con el valor generado arriba
   - Agrega TURN_REALM con tu dominio (ej: mi-app.onrender.com)
   - Las demás variables tienen valores por defecto

3. Para probar:
   - Visita: http://localhost:3000/api/turn/credentials
   - O en Render: https://tu-app.onrender.com/api/turn/credentials
    `);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Ejecutar
main();
