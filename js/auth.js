class Auth {
    constructor() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.tokenExpires = localStorage.getItem('token_expires');
    }

    login() {
        const state = this.generateState();
        localStorage.setItem('spotify_auth_state', state);

        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'token',
            redirect_uri: config.redirectUri,
            state: state,
            scope: config.scopes.join(' '),
            show_dialog: 'true'
        });

        window.location.href = `${config.authUrl}?${params.toString()}`;
    }

    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('token_expires');
        localStorage.removeItem('spotify_auth_state');
        window.location.href = '/spotify-playlist/';
    }

    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async handleCallback() {
        // El token viene en el fragmento de la URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');
        const state = params.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');

        // LOGS PARA DEPURACIÓN
        console.log('accessToken:', accessToken);
        console.log('expiresIn:', expiresIn);
        console.log('state:', state);
        console.log('storedState:', storedState);

        if (!accessToken) {
            alert('No se recibió access_token de Spotify. Intenta iniciar sesión de nuevo.');
            window.location.href = '/spotify-playlist/';
            return;
        }
        if (!state || !storedState) {
            alert('Falta el parámetro state. Intenta iniciar sesión de nuevo.');
            window.location.href = '/spotify-playlist/';
            return;
        }
        if (state !== storedState) {
            alert('El parámetro state no coincide. Intenta iniciar sesión de nuevo.');
            window.location.href = '/spotify-playlist/';
            return;
        }

        this.accessToken = accessToken;
        this.tokenExpires = Date.now() + (parseInt(expiresIn, 10) * 1000);

        localStorage.setItem('spotify_access_token', this.accessToken);
        localStorage.setItem('token_expires', this.tokenExpires);

        window.location.href = '/spotify-playlist/';
    }

    async getValidToken() {
        if (!this.accessToken) {
            return null;
        }
        if (this.tokenExpires && Date.now() >= this.tokenExpires) {
            this.logout();
            return null;
        }
        return this.accessToken;
    }
} 