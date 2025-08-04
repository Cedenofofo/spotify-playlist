class Auth {
    constructor() {
        // Inicializar inmediatamente si config está disponible
        if (window.config) {
            this.config = window.config;
            this.setupEventListeners();
            this.checkAuth();
        } else {
            // Esperar a que config se cargue
            const checkConfig = () => {
                if (window.config) {
                    this.config = window.config;
                    this.setupEventListeners();
                    this.checkAuth();
                } else {
                    // Si después de 3 segundos no hay config, mostrar error
                    setTimeout(() => {
                        if (!window.config) {
                            console.error('Configuración no disponible después de 3 segundos');
                            this.showConfigError();
                        } else {
                            checkConfig();
                        }
                    }, 3000);
                }
            };
            checkConfig();
        }
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
                
                // Guardar nuevo token
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));
                
                // Si hay nuevo refresh token, actualizarlo
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }

                // Continuar con la verificación
                this.checkAuth();
            } else {
                // Error en refresh - limpiar y mostrar login
                this.logout();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
        }
    }

    login() {
        if (!this.config) {
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
        window.location.href = authUrl;
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
        `;
        errorDiv.innerHTML = `
            <h3>Error de Configuración</h3>
            <p>No se pudo cargar la configuración de la aplicación.</p>
            <p>Por favor, recarga la página.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Recargar Página</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la autenticación
    new Auth();
}); 