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
            response_type: 'code',
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
        window.location.href = config.baseUrl + '/';
    }

    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');

        console.log('code:', code);
        console.log('state:', state);
        console.log('storedState:', storedState);

        if (!code) {
            console.error('No se recibió el código de autorización');
            window.location.href = config.baseUrl + '/';
            return;
        }

        if (!state || !storedState) {
            console.error('Falta el parámetro state');
            window.location.href = config.baseUrl + '/';
            return;
        }

        if (state !== storedState) {
            console.error('El parámetro state no coincide');
            window.location.href = config.baseUrl + '/';
            return;
        }

        try {
            // Intercambiar el código por un token
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(config.clientId + ':' + config.clientSecret)
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: config.redirectUri
                })
            });

            const data = await response.json();
            console.log('Token response:', data);

            if (data.access_token) {
                this.accessToken = data.access_token;
                this.tokenExpires = Date.now() + (data.expires_in * 1000);

                localStorage.setItem('spotify_access_token', this.accessToken);
                localStorage.setItem('token_expires', this.tokenExpires);
                localStorage.removeItem('spotify_auth_state');

                window.location.href = config.baseUrl + '/';
            } else {
                console.error('Error al obtener el token:', data);
                window.location.href = config.baseUrl + '/';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            window.location.href = config.baseUrl + '/';
        }
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

// Inicializar la autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    
    // Si estamos en la página principal, verificar si hay un token
    if (!window.location.search) {
        const token = auth.getValidToken();
        if (token) {
            console.log('Usuario autenticado');
        }
    }
}); 