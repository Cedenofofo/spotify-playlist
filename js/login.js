// ===== LOGIN FUNCTIONALITY =====

class LoginManager {
    constructor() {
        this.loginBtn = document.getElementById('spotify-login');
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                this.initiateSpotifyAuth();
            });
        }
    }
    
    checkAuthStatus() {
        const accessToken = localStorage.getItem('spotify_access_token');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const tokenFromUrl = urlParams.get('access_token');
        
        if (accessToken || code || tokenFromUrl) {
            this.redirectToDashboard();
        }
    }
    
    async initiateSpotifyAuth() {
        try {
            this.setLoadingState(true);
            
            // Generar estado aleatorio
            const state = this.generateRandomState();
            localStorage.setItem('spotify_auth_state', state);
            
            // Generar PKCE
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            localStorage.setItem('spotify_code_verifier', codeVerifier);
            
            // Construir URL
            const authUrl = this.buildAuthUrl(state, codeChallenge);
            
            // Redirigir
            window.location.href = authUrl;
            
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al conectar con Spotify', 'error');
            this.setLoadingState(false);
        }
    }
    
    buildAuthUrl(state, codeChallenge) {
        const params = new URLSearchParams({
            client_id: window.config.clientId,
            response_type: 'code',
            redirect_uri: window.config.redirectUri,
            state: state,
            scope: window.config.scopes.join(' '),
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });
        
        return `${window.config.authUrl}?${params.toString()}`;
    }
    
    generateRandomState() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }
    
    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return this.base64URLEncode(new Uint8Array(digest));
    }
    
    base64URLEncode(buffer) {
        return btoa(String.fromCharCode(...buffer))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    async handleAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        console.log('Auth callback params:', { code, state, error });
        
        if (error) {
            this.showMessage('Error: ' + error, 'error');
            return;
        }
        
        if (code && state) {
            try {
                this.setLoadingState(true);
                
                // Verificar estado
                const savedState = localStorage.getItem('spotify_auth_state');
                if (state !== savedState) {
                    this.showMessage('Error de seguridad', 'error');
                    this.setLoadingState(false);
                    return;
                }
                
                // Intercambiar código por token
                const tokenData = await this.exchangeCodeForToken(code);
                
                if (tokenData && tokenData.access_token) {
                    localStorage.setItem('spotify_access_token', tokenData.access_token);
                    if (tokenData.refresh_token) {
                        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
                    }
                    
                    localStorage.removeItem('spotify_auth_state');
                    localStorage.removeItem('spotify_code_verifier');
                    
                    this.showMessage('¡Autenticación exitosa!', 'success');
                    
                    setTimeout(() => {
                        this.redirectToDashboard();
                    }, 1500);
                } else {
                    throw new Error('No se recibió el token');
                }
                
            } catch (error) {
                console.error('Error exchanging code:', error);
                this.showMessage('Error al completar la autenticación', 'error');
                this.setLoadingState(false);
            }
        } else {
            this.showMessage('No se recibieron parámetros válidos', 'error');
            this.setLoadingState(false);
        }
    }
    
    async exchangeCodeForToken(code) {
        try {
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            
            if (!codeVerifier) {
                throw new Error('No se encontró el code_verifier');
            }
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: window.config.redirectUri,
                    client_id: window.config.clientId,
                    code_verifier: codeVerifier
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data;
            
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    }
    
    redirectToDashboard() {
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = 'pages/dashboard.html';
    }
    
    setLoadingState(loading) {
        if (this.loginBtn) {
            if (loading) {
                this.loginBtn.classList.add('loading');
                this.loginBtn.innerHTML = '<span>Conectando...</span>';
            } else {
                this.loginBtn.classList.remove('loading');
                this.loginBtn.innerHTML = '<i class="fab fa-spotify"></i><span>Conectar con Spotify</span>';
            }
        }
    }
    
    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `login-message ${type}`;
        messageElement.textContent = message;
        
        if (this.loginBtn) {
            this.loginBtn.parentNode.insertBefore(messageElement, this.loginBtn.nextSibling);
        }
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
    
    isAuthenticated() {
        return !!localStorage.getItem('spotify_access_token');
    }
    
    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }
    
    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        localStorage.removeItem('spotify_code_verifier');
        window.location.href = '../index.html';
    }
}

// ===== UTILITY FUNCTIONS =====

async function validateToken(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

async function refreshAccessToken(refreshToken) {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: window.config.clientId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                return data.access_token;
            }
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const tokenFromUrl = urlParams.get('access_token');
    
    if (code || tokenFromUrl) {
        window.loginManager.handleAuthCallback();
    }
});

// Exportar para uso global
window.LoginManager = LoginManager;
window.validateToken = validateToken;
window.refreshAccessToken = refreshAccessToken; 