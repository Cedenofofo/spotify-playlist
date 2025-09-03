const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar comandos
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error ejecutando: ${command}`);
        process.exit(1);
    }
}

// Verificar si PHP está instalado
try {
    execSync('php -v');
    console.log('✓ PHP está instalado');
} catch (error) {
    console.error('× PHP no está instalado. Por favor, instala PHP antes de continuar.');
    process.exit(1);
}

// Instalar dependencias de Node.js
console.log('Instalando dependencias de Node.js...');
runCommand('npm install');

// Crear directorio de assets si no existe
if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
    console.log('✓ Directorio assets creado');
}

// Verificar configuración de Spotify
if (!fs.existsSync('config.php')) {
    console.log('\nConfiguración de Spotify:');
    console.log('1. Ve a https://developer.spotify.com/dashboard');
    console.log('2. Crea una nueva aplicación');
    console.log('3. Configura la URL de redirección como: http://localhost:3000/callback.php');
    console.log('4. Copia el Client ID y Client Secret');
    console.log('5. Crea un archivo config.php con tus credenciales\n');
}

console.log('Instalación completada. Para iniciar la aplicación:');
console.log('1. npm run dev     # Para desarrollo');
console.log('2. npm run build   # Para crear el instalador'); 