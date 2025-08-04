class Auth {
    constructor() {
        if (window.config) {
            this.config = window.config;
            this.setupEventListeners();
            this.checkAuth();
        } else {
            this.waitForConfig();
        }
    }

    waitForConfig() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkConfig = () => {
            if (window.config) {
                this.config = window.config;
                this.setupEventListeners();
                this.checkAuth();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkConfig, 500);
            } else {
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
            if (Date.now() < parseInt(tokenExpires)) {
                if (window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') || 
                    window.location.pathname === '') {
                    
                    if (window.location.hash === '#playlist-section') {
                        this.showPlaylistSection();
                        return;
                    }
                    
                    return;
                } else {
                    this.showPlaylistSection();
                    return;
                }
            } else {
                if (refreshToken) {
                    this.refreshAccessToken(refreshToken);
                    return;
                } else {
                    this.logout();
                    return;
                }
            }
        }

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.saveTokens(data);
            
            return data.access_token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
            return null;
        }
    }

    saveTokens(data) {
        const expiresIn = data.expires_in || 3600;
        const expiresAt = Date.now() + (expiresIn * 1000);
        
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expires', expiresAt.toString());
        
        if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
    }

    login() {
        const state = this.generateState();
        const scopes = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
        
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&show_dialog=true`;
        
        window.location.href = authUrl;
    }

    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires');
        localStorage.removeItem('spotify_user_id');
        localStorage.removeItem('spotify_user_name');
        
        window.location.href = 'index.html';
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    showPlaylistSection() {
        const playlistSection = document.getElementById('playlist-section');
        const heroSection = document.querySelector('.hero-parallax');
        const featuresSection = document.querySelector('.features-section');
        
        if (playlistSection) {
            playlistSection.style.display = 'block';
            
            if (heroSection) heroSection.style.display = 'none';
            if (featuresSection) featuresSection.style.display = 'none';
            
            playlistSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showLoginSection() {
        const loginSection = document.getElementById('login-section');
        const playlistSection = document.getElementById('playlist-section');
        
        if (loginSection) {
            loginSection.style.display = 'block';
        }
        
        if (playlistSection) {
            playlistSection.style.display = 'none';
        }
    }

    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }

    showConfigError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        errorDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Error de Configuración</h3>
            <p style="margin-bottom: 1.5rem; opacity: 0.9;">
                No se pudo cargar la configuración de la aplicación. 
                Por favor, recarga la página o contacta al administrador.
            </p>
            <button onclick="location.reload()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                Recargar Página
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    async checkNetworkStatus() {
        try {
            const response = await fetch('https://httpbin.org/get', { 
                method: 'HEAD',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    showNetworkError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        errorDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Error de Conexión</h3>
            <p style="margin-bottom: 1.5rem; opacity: 0.9;">
                No se pudo conectar con los servidores. 
                Verifica tu conexión a internet e intenta nuevamente.
            </p>
            <button onclick="location.reload()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                Reintentar
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    }
}

window.Auth = Auth; 