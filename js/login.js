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
        
        // Manejar tecla Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.initiateSpotifyAuth();
            }
        });
    }
    
    checkAuthStatus() {
        const accessToken = localStorage.getItem('spotify_access_token');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const tokenFromUrl = urlParams.get('access_token');
        
        if (accessToken || code || tokenFromUrl) {
            // Si ya está autenticado, redirigir al dashboard
            this.redirectToDashboard();
        }
    }
    
    async initiateSpotifyAuth() {
        try {
            this.setLoadingState(true);
            
            // Generar estado aleatorio para seguridad
            const state = this.generateRandomState();
            localStorage.setItem('spotify_auth_state', state);
            
            // Generar PKCE challenge
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            localStorage.setItem('spotify_code_verifier', codeVerifier);
            
            // Construir URL de autorización
            const authUrl = this.buildAuthUrl(state, codeChallenge);
            
            // Redirigir a Spotify
            window.location.href = authUrl;
            
        } catch (error) {
            console.error('Error initiating Spotify auth:', error);
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
            show_dialog: 'true',
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
    
    async handleAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const tokenFromUrl = urlParams.get('access_token');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            this.showMessage('Error de autorización: ' + error, 'error');
            return;
        }
        
        // Manejar token directo en URL (Implicit Grant)
        if (tokenFromUrl) {
            try {
                this.setLoadingState(true);
                
                // Verificar estado para prevenir CSRF
                const savedState = localStorage.getItem('spotify_auth_state');
                if (state && savedState && state !== savedState) {
                    this.showMessage('Error de seguridad en la autenticación', 'error');
                    this.setLoadingState(false);
                    return;
                }
                
                // Guardar token directamente
                localStorage.setItem('spotify_access_token', tokenFromUrl);
                
                // Limpiar estado
                localStorage.removeItem('spotify_auth_state');
                
                // Mostrar mensaje de éxito
                this.showMessage('¡Autenticación exitosa!', 'success');
                
                // Redirigir al dashboard después de un breve delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
                
            } catch (error) {
                console.error('Error handling direct token:', error);
                this.showMessage('Error al procesar la autenticación', 'error');
                this.setLoadingState(false);
            }
        } else if (code) {
            // Código de autorización recibido (Authorization Code Flow)
            try {
                this.setLoadingState(true);
                
                // Verificar estado para prevenir CSRF
                const savedState = localStorage.getItem('spotify_auth_state');
                if (state && savedState && state !== savedState) {
                    this.showMessage('Error de seguridad en la autenticación', 'error');
                    this.setLoadingState(false);
                    return;
                }
                
                // Intercambiar código por token usando PKCE
                const tokenData = await this.exchangeCodeForToken(code);
                
                if (tokenData && tokenData.access_token) {
                    // Guardar token
                    localStorage.setItem('spotify_access_token', tokenData.access_token);
                    if (tokenData.refresh_token) {
                        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
                    }
                    
                    // Limpiar estado
                    localStorage.removeItem('spotify_auth_state');
                    
                    // Mostrar mensaje de éxito
                    this.showMessage('¡Autenticación exitosa!', 'success');
                    
                    // Redirigir al dashboard después de un breve delay
                    setTimeout(() => {
                        this.redirectToDashboard();
                    }, 1500);
                } else {
                    throw new Error('No se recibió el token de acceso');
                }
                
            } catch (error) {
                console.error('Error exchanging code for token:', error);
                this.showMessage('Error al completar la autenticación', 'error');
                this.setLoadingState(false);
            }
        } else {
            // No hay parámetros de autenticación válidos
            this.showMessage('No se recibieron parámetros de autenticación válidos', 'error');
            this.setLoadingState(false);
        }
    }
    
    async exchangeCodeForToken(code) {
        try {
            // Obtener code_verifier guardado
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            
            if (!codeVerifier) {
                throw new Error('No se encontró el code_verifier');
            }
            
            // Intercambiar código por token
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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Limpiar code_verifier
            localStorage.removeItem('spotify_code_verifier');
            
            return data;
            
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
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
    
    redirectToDashboard() {
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirigir al dashboard
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
        // Remover mensajes existentes
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `login-message ${type}`;
        messageElement.textContent = message;
        
        // Insertar después del botón
        if (this.loginBtn) {
            this.loginBtn.parentNode.insertBefore(messageElement, this.loginBtn.nextSibling);
        }
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
    
    // Método para verificar si el usuario está autenticado
    isAuthenticated() {
        const accessToken = localStorage.getItem('spotify_access_token');
        return !!accessToken;
    }
    
    // Método para obtener el token de acceso
    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }
    
    // Método para cerrar sesión
    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        localStorage.removeItem('spotify_code_verifier');
        
        // Redirigir al login
        window.location.href = '../index.html';
    }
}

// ===== UTILITY FUNCTIONS =====

// Función para manejar errores de red
function handleNetworkError(error) {
    console.error('Network error:', error);
    return {
        error: 'Error de conexión. Verifica tu conexión a internet.'
    };
}

// Función para validar token
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

// Función para refrescar token
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

// Inicializar login manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
    
    // Manejar callback de autenticación si es necesario
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