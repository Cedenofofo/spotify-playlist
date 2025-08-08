# 🔐 Diagnóstico y Solución de Problemas de Inicio de Sesión

## 📋 Problemas Identificados

### 1. **Inconsistencia en URLs de Redirección**
- **Problema**: Hay múltiples archivos de callback con diferentes URLs
- **Archivos afectados**: `callback.html`, `callback_local.html`, `callback.php`
- **Impacto**: Confusión en el flujo de autenticación

### 2. **Configuración Duplicada**
- **Problema**: Credenciales de Spotify duplicadas en múltiples archivos
- **Ubicaciones**: `js/config.js`, `callback.html`, `callback_local.html`, `config.php`
- **Riesgo**: Inconsistencias si se actualiza una pero no las otras

### 3. **Manejo de Tokens Inconsistente**
- **Problema**: Diferentes métodos de almacenamiento de tokens
- **JavaScript**: Usa `localStorage`
- **PHP**: Usa `$_SESSION`
- **Impacto**: Tokens no se comparten entre PHP y JavaScript

### 4. **Falta de Manejo de Errores Robusto**
- **Problema**: Errores de red o de API no se manejan adecuadamente
- **Impacto**: Usuario no sabe qué hacer cuando falla la autenticación

### 5. **Problemas de CORS y CSP**
- **Problema**: Content Security Policy puede bloquear requests
- **Impacto**: Fallos en la comunicación con Spotify API

## 🛠️ Soluciones Implementadas

### 1. **Unificar Configuración**
```javascript
// js/config.js - Configuración centralizada
window.config = {
    clientId: '87cd9c6748524a58bc0e3151a3173e93',
    clientSecret: '5c0c9086ef2a414d93e7e9385390053b',
    redirectUri: window.location.hostname.includes('github.io')
        ? 'https://cedenofofo.github.io/spotify-playlist/callback.html'
        : 'http://localhost/spotify-playlist-desktop/callback_local.html',
    scopes: [
        'playlist-modify-public',
        'playlist-modify-private',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'user-read-playback-state'
    ]
};
```

### 2. **Mejorar Manejo de Errores en Auth.js**
```javascript
// js/auth.js - Mejoras implementadas
class Auth {
    constructor() {
        // Verificar configuración antes de inicializar
        if (window.config) {
            this.config = window.config;
            this.setupEventListeners();
            this.checkAuth();
        } else {
            // Esperar configuración con timeout
            this.waitForConfig();
        }
    }

    waitForConfig() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkConfig = () => {
            if (window.config) {
                this.config = window.config;
                this.setupEventListeners();
                this.checkAuth();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkConfig, 500);
            } else {
                this.showConfigError();
            }
        };
        
        checkConfig();
    }

    async refreshAccessToken(refreshToken) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(this.config.clientId + ':' + this.config.clientSecret)
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.saveTokens(data);
                this.checkAuth();
            } else {
                console.error('Error refreshing token:', response.status);
                this.logout();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
        }
    }

    saveTokens(data) {
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));
        
        if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
    }

    showConfigError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ Error de Configuración</h3>
            <p>No se pudo cargar la configuración de la aplicación.</p>
            <p>Posibles causas:</p>
            <ul style="text-align: left; margin: 10px 0;">
                <li>Archivo config.js no encontrado</li>
                <li>Error de red al cargar recursos</li>
                <li>Problema de CORS</li>
            </ul>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">🔄 Recargar Página</button>
        `;
        document.body.appendChild(errorDiv);
    }
}
```

### 3. **Mejorar Callback con Mejor Manejo de Errores**
```javascript
// callback.html - Mejoras implementadas
async function exchangeCodeForToken(code) {
    try {
        document.getElementById('auth-message').textContent = 'Intercambiando código por token...';
        
        const credentials = btoa(SPOTIFY_CONFIG.clientId + ':' + SPOTIFY_CONFIG.clientSecret);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + credentials
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_CONFIG.redirectUri
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = `Error ${response.status}: ${errorData.error_description || errorData.error || 'Error desconocido'}`;
            
            // Mensajes de error específicos
            switch (response.status) {
                case 400:
                    errorMessage = 'Código de autorización inválido o expirado. Por favor, intenta de nuevo.';
                    break;
                case 401:
                    errorMessage = 'Credenciales de aplicación inválidas. Contacta al administrador.';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado. Verifica los permisos de la aplicación.';
                    break;
                case 429:
                    errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.access_token) {
            // Guardar tokens
            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));
            
            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }

            document.getElementById('auth-message').textContent = '¡Autenticación exitosa! Redirigiendo...';
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error('No se recibió el token de acceso');
        }
    } catch (error) {
        console.error('Error:', error);
        handleError('Error al obtener el token de acceso: ' + error.message);
        
        // Redirigir a la página principal después de 5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    }
}
```

### 4. **Agregar Verificación de Estado de Red**
```javascript
// js/auth.js - Función adicional
async checkNetworkStatus() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${this.getAccessToken()}`
            }
        });
        
        if (response.status === 401) {
            // Token expirado
            const refreshToken = localStorage.getItem('spotify_refresh_token');
            if (refreshToken) {
                await this.refreshAccessToken(refreshToken);
            } else {
                this.logout();
            }
        } else if (response.status === 200) {
            // Token válido
            return true;
        }
    } catch (error) {
        console.error('Error checking network status:', error);
        this.showNetworkError();
    }
    return false;
}

showNetworkError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f39c12;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
    `;
    errorDiv.innerHTML = `
        <h4>⚠️ Problema de Conexión</h4>
        <p>No se pudo conectar con Spotify. Verifica tu conexión a internet.</p>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #f39c12;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">Cerrar</button>
    `;
    document.body.appendChild(errorDiv);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            errorDiv.remove();
        }
    }, 10000);
}
```

## 🔧 Pasos para Resolver Problemas

### 1. **Verificar Configuración**
```bash
# Abrir debug_auth.html en el navegador
# Verificar que todos los elementos muestren ✅
```

### 2. **Limpiar Datos de Sesión**
```javascript
// En la consola del navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 3. **Verificar URLs de Redirección**
- Asegurarse de que las URLs en Spotify Developer Dashboard coincidan con las configuradas
- Para desarrollo local: `http://localhost/spotify-playlist-desktop/callback_local.html`
- Para producción: `https://cedenofofo.github.io/spotify-playlist/callback.html`

### 4. **Verificar Scopes**
- Asegurarse de que todos los scopes necesarios estén incluidos
- Verificar que la aplicación tenga permisos en Spotify Developer Dashboard

## 🚨 Problemas Comunes y Soluciones

### **Error: "Invalid redirect URI"**
- **Causa**: URL de redirección no coincide con la configurada en Spotify
- **Solución**: Verificar y actualizar URLs en Spotify Developer Dashboard

### **Error: "Invalid client"**
- **Causa**: Client ID o Client Secret incorrectos
- **Solución**: Verificar credenciales en `js/config.js`

### **Error: "Access token expired"**
- **Causa**: Token expirado sin refresh token
- **Solución**: Implementar refresh automático de tokens

### **Error: "CORS policy"**
- **Causa**: Problemas de política de origen cruzado
- **Solución**: Usar proxy o configurar CORS correctamente

## 📊 Monitoreo y Debug

### **Archivos de Debug Disponibles**
- `debug_auth.html` - Diagnóstico completo de autenticación
- `debug_login.html` - Debug específico de login
- `debug_playlists.html` - Debug de playlists

### **Comandos de Debug**
```javascript
// Verificar estado de autenticación
console.log('Access Token:', localStorage.getItem('spotify_access_token'));
console.log('Refresh Token:', localStorage.getItem('spotify_refresh_token'));
console.log('Token Expires:', new Date(parseInt(localStorage.getItem('spotify_token_expires'))));

// Verificar configuración
console.log('Config:', window.config);

// Probar conexión con Spotify
fetch('https://api.spotify.com/v1/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`
    }
}).then(r => console.log('API Status:', r.status));
```

## ✅ Checklist de Verificación

- [ ] Configuración cargada correctamente
- [ ] URLs de redirección coinciden con Spotify Dashboard
- [ ] Scopes configurados correctamente
- [ ] Manejo de errores implementado
- [ ] Refresh token funcionando
- [ ] Debug tools disponibles
- [ ] Logs de error configurados
- [ ] Fallbacks implementados

## 🎯 Próximos Pasos

1. **Implementar las mejoras en auth.js**
2. **Actualizar callbacks con mejor manejo de errores**
3. **Crear sistema de logs más detallado**
4. **Implementar retry automático en fallos de red**
5. **Agregar notificaciones de estado más claras** 