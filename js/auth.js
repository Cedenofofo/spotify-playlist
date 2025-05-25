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
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const expiresIn = urlParams.get('expires_in');

        if (accessToken) {
            // Guardar el token en localStorage
            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('token_expires', Date.now() + (expiresIn * 1000));
            
            // Limpiar la URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Mostrar la sección de playlist
            this.showPlaylistSection();
        } else if (localStorage.getItem('spotify_access_token')) {
            // Verificar si el token ha expirado
            const expiresAt = localStorage.getItem('token_expires');
            if (Date.now() < expiresAt) {
                this.showPlaylistSection();
            } else {
                this.logout();
            }
        }
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
        localStorage.removeItem('token_expires');
        localStorage.removeItem('spotify_auth_state');
        window.location.reload();
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }

    showPlaylistSection() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('playlist-section').style.display = 'block';
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