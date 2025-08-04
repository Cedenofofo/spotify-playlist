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
                    setTimeout(checkConfig, 50);
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
                // Token expirado - limpiar y mostrar login
                this.logout();
                return;
            }
        }

        // No hay token válido - mostrar login
        this.showLoginSection();
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
        const loginSection = document.getElementById('login-section');
        const playlistSection = document.getElementById('playlist-section');
        const heroSection = document.querySelector('.hero-parallax');
        const featuresSection = document.querySelector('.features-section');
        
        // Ocultar secciones principales
        if (heroSection) heroSection.style.display = 'none';
        if (featuresSection) featuresSection.style.display = 'none';
        if (loginSection) loginSection.style.display = 'none';
        
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
        const loginSection = document.getElementById('login-section');
        const playlistSection = document.getElementById('playlist-section');
        
        if (loginSection) loginSection.style.display = 'block';
        if (playlistSection) playlistSection.style.display = 'none';
    }

    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la autenticación
    new Auth();
}); 