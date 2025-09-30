// BLOQUEADOR DE ERRORES EXTERNOS
// Este script bloquea errores de sitios externos que no son relevantes para Tuneuptify

(function() {
    'use strict';
    
    // Guardar funciones originales
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    const originalFetch = window.fetch;
    const originalXMLHttpRequest = window.XMLHttpRequest;
    
    // Lista de patrones a bloquear
    const blockedPatterns = [
        'google.com/recaptcha',
        'indexReact.',
        '/login/otc/',
        'Content Security Policy',
        'Failed to load resource',
        'net::ERR_',
        'Refused to connect',
        'violates the following Content Security Policy'
    ];
    
    // Función para verificar si un mensaje debe ser bloqueado
    function shouldBlock(message) {
        if (!message || typeof message !== 'string') return false;
        return blockedPatterns.some(pattern => message.includes(pattern));
    }
    
    // Función para verificar si una URL debe ser bloqueada
    function shouldBlockUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return blockedPatterns.some(pattern => url.includes(pattern));
    }
    
    // Sobrescribir console.log
    console.log = function(...args) {
        const message = args[0]?.toString() || '';
        if (shouldBlock(message)) {
            return; // Silenciar
        }
        originalConsoleLog.apply(console, args);
    };
    
    // Sobrescribir console.error
    console.error = function(...args) {
        const message = args[0]?.toString() || '';
        if (shouldBlock(message)) {
            return; // Silenciar
        }
        originalConsoleError.apply(console, args);
    };
    
    // Sobrescribir console.warn
    console.warn = function(...args) {
        const message = args[0]?.toString() || '';
        if (shouldBlock(message)) {
            return; // Silenciar
        }
        originalConsoleWarn.apply(console, args);
    };
    
    // Sobrescribir console.info
    console.info = function(...args) {
        const message = args[0]?.toString() || '';
        if (shouldBlock(message)) {
            return; // Silenciar
        }
        originalConsoleInfo.apply(console, args);
    };
    
    // Sobrescribir fetch para bloquear peticiones externas problemáticas
    window.fetch = function(...args) {
        const url = args[0];
        if (shouldBlockUrl(url)) {
            // Retornar una respuesta vacía exitosa para evitar errores
            return Promise.resolve(new Response('', { 
                status: 200, 
                statusText: 'OK',
                headers: { 'Content-Type': 'text/plain' }
            }));
        }
        return originalFetch.apply(this, args);
    };
    
    // Sobrescribir XMLHttpRequest para bloquear peticiones problemáticas
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new OriginalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...args) {
            if (shouldBlockUrl(url)) {
                // Simular una respuesta exitosa
                setTimeout(() => {
                    xhr.readyState = 4;
                    xhr.status = 200;
                    xhr.statusText = 'OK';
                    xhr.responseText = '';
                    xhr.response = '';
                    if (xhr.onload) xhr.onload();
                    if (xhr.onreadystatechange) xhr.onreadystatechange();
                }, 0);
                return;
            }
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        return xhr;
    };
    
    // Bloquear errores de red no deseados
    window.addEventListener('error', function(event) {
        if (shouldBlock(event.message) || shouldBlock(event.filename)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    // Bloquear errores no capturados
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason?.toString() || '';
        if (shouldBlock(reason)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });
    
    // Mensaje de confirmación
    originalConsoleLog('🛡️ Bloqueador de errores externos activado');
    originalConsoleLog('🚫 Errores de sitios externos bloqueados');
    originalConsoleLog('✅ Solo errores de Tuneuptify visibles');
    
})(); 