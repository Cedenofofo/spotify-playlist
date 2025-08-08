#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generar versión basada en timestamp
const version = Date.now();

// Archivos HTML que necesitan actualización
const htmlFiles = [
    'index.html',
    'create-playlist.html',
    'dashboard.html',
    'callback.html'
];

// Función para actualizar versiones en un archivo HTML
function updateVersionsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar CSS files
        content = content.replace(
            /href="css\/([^"]+)"/g,
            `href="css/$1?v=${version}"`
        );
        
        // Actualizar JS files
        content = content.replace(
            /src="js\/([^"]+)"/g,
            `src="js/$1?v=${version}"`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Actualizar todos los archivos HTML
console.log('🔄 Actualizando versiones de archivos...');
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        updateVersionsInFile(file);
    }
});

console.log('✅ Actualización de versiones completada!');
console.log(`📝 Versión generada: ${version}`); 