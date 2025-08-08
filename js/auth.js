class Auth {
    constructor() {
        // Inicializar inmediatamente si config está disponible
        if (window.config) {
            this.config = window.config;
            this.setupEventListeners();
            this.checkAuth();
        } else {
            // Esperar a que config se cargue con mejor manejo
            this.waitForConfig();
        }
    }

    waitForConfig() {
        let attempts = 0;
        const maxAttempts = this.config?.maxRetries || 10;
        const retryDelay = this.config?.retryDelay || 500;
        
        const checkConfig = () => {
            if (window.config) {
                this.config = window.config;
                this.setupEventListeners();
                this.checkAuth();
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`Esperando configuración... Intento ${attempts}/${maxAttempts}`);
                setTimeout(checkConfig, retryDelay);
            } else {
                console.error(`Configuración no disponible después de ${maxAttempts * retryDelay / 1000} segundos`);
                this.showConfigError();
            }
        };
        
        checkConfig();
    }

    setupEventListeners() {
        const loginButton = document.getElementById('login-button');
        
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.login();
            });
        }
    }

    checkAuth() {
        const accessToken = localStorage.getItem('spotify_access_token');
        const tokenExpires = localStorage.getItem('spotify_token_expires');
        const refreshToken = localStorage.getItem('spotify_refresh_token');

        if (accessToken && tokenExpires) {
            // Verificar si el token ha expirado
            if (Date.now() < parseInt(tokenExpires)) {
                // Token válido
                if (window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') || 
                    window.location.pathname === '') {
                    
                    // Si hay un hash #playlist-section, mostrar el formulario
                    if (window.location.hash === '#playlist-section') {
                        this.showPlaylistSection();
                        return;
                    }
                    
                    // Mantener en la página principal
                    return;
                } else {
                    // Si estamos en otra página, mostrar la sección de playlist
                    this.showPlaylistSection();
                    return;
                }
            } else {
                // Token expirado - intentar refresh
                if (refreshToken) {
                    this.refreshAccessToken(refreshToken);
                    return;
                } else {
                    // No hay refresh token - limpiar y mostrar login
                    this.logout();
                    return;
                }
            }
        }

        // No hay token válido - mostrar login
        this.showLoginSection();
    }

    async refreshAccessToken(refreshToken) {
        try {
            console.log('Intentando refrescar token...');
            
            // Verificar conectividad antes de hacer la petición
            if (!await this.checkNetworkStatus()) {
                throw new Error('Sin conexión a internet');
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config?.requestTimeout || 10000);
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(this.config.clientId + ':' + this.config.clientSecret)
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                this.saveTokens(data);
                console.log('Token refrescado exitosamente');
                this.checkAuth();
            } else {
                console.error('Error refreshing token:', response.status);
                const errorData = await response.json().catch(() => ({}));
                console.error('Error details:', errorData);
                
                // Manejar errores específicos
                if (response.status === 401) {
                    console.log('Token de refresh inválido, limpiando sesión');
                } else if (response.status === 429) {
                    console.log('Demasiadas solicitudes, esperando...');
                    setTimeout(() => this.refreshAccessToken(refreshToken), 5000);
                    return;
                }
                
                this.logout();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            if (error.name === 'AbortError') {
                this.showNetworkError('Timeout en la solicitud');
            } else {
                this.showNetworkError();
            }
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

    async login() {
        if (!this.config) {
            console.error('Configuración no disponible');
            this.showConfigError();
            return;
        }
        
        try {
            console.log('Iniciando proceso de login...');
            console.log('Configuración actual:', {
                clientId: this.config.clientId,
                redirectUri: this.config.redirectUri,
                authUrl: this.config.authUrl,
                scopes: this.config.scopes
            });
            
            // Verificar conectividad antes de iniciar login
            if (!await this.checkNetworkStatus()) {
                this.showNetworkError();
                return;
            }
            
            const state = this.generateState();
            localStorage.setItem('spotify_auth_state', state);

            const params = new URLSearchParams({
                client_id: this.config.clientId,
                response_type: 'code',
                redirect_uri: this.config.redirectUri,
                state: state,
                scope: this.config.scopes.join(' '),
                show_dialog: 'true'
            });

            const authUrl = `${this.config.authUrl}?${params.toString()}`;
            console.log('Redirigiendo a Spotify Auth:', authUrl);
            
            // Verificar que la URL sea válida
            try {
                new URL(authUrl);
            } catch (urlError) {
                console.error('URL de autenticación inválida:', authUrl);
                throw new Error('URL de autenticación inválida');
            }
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Error al iniciar login:', error);
            this.showNetworkError(`Error de inicio de sesión: ${error.message}`);
        }
    }

    logout() {
        // Limpiar localStorage
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
        // Limpiar sessionStorage también
        sessionStorage.clear();
        
        // Redirigir a la página principal
        if (window.location.pathname !== 'index.html' && 
            window.location.pathname !== '/' && 
            window.location.pathname !== '') {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }

    showPlaylistSection() {
        const playlistSection = document.getElementById('playlist-section');
        const heroSection = document.querySelector('.hero-parallax');
        const featuresSection = document.querySelector('.features-section');
        
        // Ocultar secciones principales
        if (heroSection) heroSection.style.display = 'none';
        if (featuresSection) featuresSection.style.display = 'none';
        
        // Mostrar sección de playlist
        if (playlistSection) {
            playlistSection.style.display = 'block';
            
            // Scroll suave hacia el formulario
            setTimeout(() => {
                playlistSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
            
            // Agregar animación de entrada
            playlistSection.style.opacity = '0';
            playlistSection.style.transform = 'translateY(30px)';
            playlistSection.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                playlistSection.style.opacity = '1';
                playlistSection.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    showLoginSection() {
        const playlistSection = document.getElementById('playlist-section');
        const heroSection = document.querySelector('.hero-parallax');
        const featuresSection = document.querySelector('.features-section');
        
        // Mostrar secciones principales (hero y features)
        if (heroSection) heroSection.style.display = 'block';
        if (featuresSection) featuresSection.style.display = 'block';
        
        // Ocultar sección de playlist si existe
        if (playlistSection) playlistSection.style.display = 'none';
    }

    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }

    showConfigError() {
        // Mostrar mensaje de error si la configuración no se carga
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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

    async checkNetworkStatus() {
        try {
            // Primero verificar conectividad básica
            const testResponse = await fetch('https://api.spotify.com/v1', {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            
            if (!testResponse.ok && testResponse.status !== 401) {
                return false;
            }
            
            // Si hay token, verificar que sea válido
            const token = this.getAccessToken();
            if (token) {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.status === 401) {
                    // Token expirado
                    const refreshToken = localStorage.getItem('spotify_refresh_token');
                    if (refreshToken) {
                        await this.refreshAccessToken(refreshToken);
                        return true;
                    } else {
                        this.logout();
                        return false;
                    }
                } else if (response.status === 200) {
                    // Token válido
                    return true;
                }
            }
            
            return true; // Conexión disponible, pero sin token válido
        } catch (error) {
            console.error('Error checking network status:', error);
            return false;
        }
    }

    showNetworkError(message = 'No se pudo conectar con Spotify. Verifica tu conexión a internet.') {
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
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        errorDiv.innerHTML = `
            <h4>⚠️ Problema de Conexión</h4>
            <p>${message}</p>
            <div style="margin-top: 10px;">
                <button onclick="this.parentElement.remove()" style="
                    background: white;
                    color: #f39c12;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 5px;
                ">Cerrar</button>
                <button onclick="window.location.reload()" style="
                    background: #1db954;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Reintentar</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 15 segundos
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                errorDiv.remove();
            }
        }, 10000);
    }
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la autenticación
    new Auth();
}); 