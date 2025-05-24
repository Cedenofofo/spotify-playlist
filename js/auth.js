class Auth {
    constructor() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
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
        localStorage.removeItem('spotify_refresh_token');
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
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');

        if (!code || !state || state !== storedState) {
            throw new Error('Invalid state or missing code');
        }

        const tokenResponse = await fetch(config.tokenUrl, {
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

        const data = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(data.error || 'Failed to get access token');
        }

        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.tokenExpires = Date.now() + (data.expires_in * 1000);

        localStorage.setItem('spotify_access_token', this.accessToken);
        localStorage.setItem('spotify_refresh_token', this.refreshToken);
        localStorage.setItem('token_expires', this.tokenExpires);

        window.location.href = '/spotify-playlist/';
    }

    async getValidToken() {
        if (!this.accessToken) {
            return null;
        }

        if (Date.now() >= this.tokenExpires) {
            await this.refreshAccessToken();
        }

        return this.accessToken;
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(config.clientId + ':' + config.clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to refresh token');
        }

        this.accessToken = data.access_token;
        this.tokenExpires = Date.now() + (data.expires_in * 1000);

        if (data.refresh_token) {
            this.refreshToken = data.refresh_token;
            localStorage.setItem('spotify_refresh_token', this.refreshToken);
        }

        localStorage.setItem('spotify_access_token', this.accessToken);
        localStorage.setItem('token_expires', this.tokenExpires);
    }
} 