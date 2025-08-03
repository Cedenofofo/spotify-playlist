class Auth {
    constructor() {
        if (!window.config) {
            console.error('Configuración no disponible');
            return;
        }
        this.config = window.config;
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.login());
        }
    }

    checkAuth() {
        // Verificar si ya tenemos un token válido en localStorage
        const accessToken = localStorage.getItem('spotify_access_token');
        const tokenExpires = localStorage.getItem('spotify_token_expires');

        if (accessToken && tokenExpires) {
            // Verificar si el token ha expirado
            if (Date.now() < parseInt(tokenExpires)) {
                // Token válido - redirigir al dashboard si estamos en la página principal
                if (window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') || 
                    window.location.pathname === '') {
                    this.redirectToDashboard();
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
            console.error('Configuración no disponible');
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

        window.location.href = `${this.config.authUrl}?${params.toString()}`;
    }

    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
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
        
        if (loginSection) loginSection.style.display = 'none';
        if (playlistSection) playlistSection.style.display = 'block';
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