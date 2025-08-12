// Cache Cleaner - Forzar recarga de recursos
(function() {
    'use strict';
    
    console.log('🧹 Cache Cleaner iniciado');
    
    // Función para limpiar cache de recursos
    function clearResourceCache() {
        // Limpiar cache de imágenes
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src) {
                img.src = img.src + '?v=' + Date.now();
            }
        });
        
        // Limpiar cache de CSS
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            if (link.href && !link.href.includes('cdnjs.cloudflare.com') && !link.href.includes('fonts.googleapis.com')) {
                link.href = link.href + '?v=' + Date.now();
            }
        });
        
        // Limpiar cache de JS
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src && !script.src.includes('cdnjs.cloudflare.com')) {
                script.src = script.src + '?v=' + Date.now();
            }
        });
        
        console.log('✅ Cache de recursos limpiado');
    }
    
    // Función para forzar recarga de página
    function forceReload() {
        console.log('🔄 Forzando recarga de página...');
        window.location.reload(true);
    }
    
    // Función para limpiar localStorage y sessionStorage
    function clearStorage() {
        try {
            // Mantener solo los tokens de Spotify
            const spotifyTokens = {
                spotify_access_token: localStorage.getItem('spotify_access_token'),
                spotify_token_expires: localStorage.getItem('spotify_token_expires'),
                spotify_refresh_token: localStorage.getItem('spotify_refresh_token'),
                spotify_auth_state: localStorage.getItem('spotify_auth_state')
            };
            
            // Limpiar todo
            localStorage.clear();
            sessionStorage.clear();
            
            // Restaurar tokens de Spotify
            Object.keys(spotifyTokens).forEach(key => {
                if (spotifyTokens[key]) {
                    localStorage.setItem(key, spotifyTokens[key]);
                }
            });
            
            console.log('✅ Storage limpiado (tokens de Spotify preservados)');
        } catch (error) {
            console.error('❌ Error limpiando storage:', error);
        }
    }
    
    // Función para verificar si hay problemas de CSP
    function checkCSPIssues() {
        const cspErrors = [];
        
        // Interceptar errores de CSP
        const originalError = console.error;
        console.error = function(...args) {
            const message = args.join(' ');
            if (message.includes('Content Security Policy') || 
                message.includes('CSP') || 
                message.includes('Refused to connect')) {
                cspErrors.push(message);
            }
            originalError.apply(console, args);
        };
        
        // Verificar después de 2 segundos
        setTimeout(() => {
            if (cspErrors.length > 0) {
                console.warn('⚠️ Se detectaron problemas de CSP:', cspErrors.length, 'errores');
                console.log('🔄 Intentando limpiar cache...');
                clearResourceCache();
            }
        }, 2000);
    }
    
    // Función para bloquear errores de tracking
    function blockTrackingErrors() {
        const originalWarn = console.warn;
        console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('Tracking Prevention') || 
                message.includes('Failed to load resource') ||
                message.includes('net::ERR_')) {
                return; // No mostrar estos errores
            }
            originalWarn.apply(console, args);
        };
    }
    
    // Función para bloquear errores de deprecación
    function blockDeprecationWarnings() {
        const originalWarn = console.warn;
        console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('-ms-high-contrast') || 
                message.includes('deprecated') ||
                message.includes('Deprecation')) {
                return; // No mostrar advertencias de deprecación
            }
            originalWarn.apply(console, args);
        };
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🚀 Cache Cleaner inicializado');
        
        // Bloquear errores molestos
        blockTrackingErrors();
        blockDeprecationWarnings();
        
        // Verificar problemas de CSP
        checkCSPIssues();
        
        // Limpiar cache automáticamente cada 5 minutos
        setInterval(clearResourceCache, 5 * 60 * 1000);
        
        // Agregar botón de limpieza manual (solo en desarrollo)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addCleanupButton();
        }
    }
    
    function addCleanupButton() {
        const button = document.createElement('button');
        button.innerHTML = '🧹 Limpiar Cache';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #1db954;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.8;
        `;
        
        button.addEventListener('click', () => {
            clearResourceCache();
            clearStorage();
            setTimeout(forceReload, 1000);
        });
        
        document.body.appendChild(button);
    }
    
    // Exportar funciones para uso manual
    window.CacheCleaner = {
        clearResourceCache,
        clearStorage,
        forceReload,
        checkCSPIssues
    };
    
})(); 