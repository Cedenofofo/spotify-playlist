// ===== DASHBOARD FUNCTIONALITY =====

class DashboardManager {
    constructor() {
        this.accessToken = null;
        this.userInfo = null;
        this.init();
    }
    
    init() {
        this.checkAuthentication();
        this.loadUserInfo();
        this.setupEventListeners();
    }
    
    checkAuthentication() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        
        if (!this.accessToken) {
            // Si no está autenticado, redirigir al login
            window.location.href = '../index.html';
            return;
        }
        
        // Verificar si el token es válido
        this.validateToken();
    }
    
    async validateToken() {
        try {
            const isValid = await validateToken(this.accessToken);
            
            if (!isValid) {
                // Intentar refrescar el token
                const refreshToken = localStorage.getItem('spotify_refresh_token');
                if (refreshToken) {
                    const newToken = await refreshAccessToken(refreshToken);
                    if (newToken) {
                        this.accessToken = newToken;
                        return;
                    }
                }
                
                // Si no se puede refrescar, redirigir al login
                this.logout();
                return;
            }
            
        } catch (error) {
            console.error('Error validating token:', error);
            this.logout();
        }
    }
    
    async loadUserInfo() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                this.userInfo = await response.json();
                this.updateUserInterface();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error loading user info:', error);
            this.showMessage('Error al cargar información del usuario', 'error');
        }
    }
    
    updateUserInterface() {
        if (!this.userInfo) return;
        
        // Actualizar avatar del navbar
        const navbarAvatar = document.getElementById('user-avatar');
        const navbarName = document.getElementById('user-name');
        
        if (navbarAvatar && this.userInfo.images && this.userInfo.images.length > 0) {
            navbarAvatar.src = this.userInfo.images[0].url;
        }
        
        if (navbarName) {
            navbarName.textContent = this.userInfo.display_name || 'Usuario';
        }
        
        // Actualizar información del dashboard
        const dashboardAvatar = document.getElementById('dashboard-user-avatar');
        const dashboardName = document.getElementById('dashboard-user-name');
        const dashboardEmail = document.getElementById('dashboard-user-email');
        
        if (dashboardAvatar && this.userInfo.images && this.userInfo.images.length > 0) {
            dashboardAvatar.src = this.userInfo.images[0].url;
        }
        
        if (dashboardName) {
            dashboardName.textContent = this.userInfo.display_name || 'Usuario';
        }
        
        if (dashboardEmail) {
            dashboardEmail.textContent = this.userInfo.email || 'usuario@example.com';
        }
    }
    
    setupEventListeners() {
        // Event listeners para las opciones del dashboard
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleOptionClick(e.currentTarget);
            });
            
            // Agregar soporte para teclado
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleOptionClick(e.currentTarget);
                }
            });
            
            // Hacer las tarjetas focusables
            card.setAttribute('tabindex', '0');
        });
    }
    
    handleOptionClick(card) {
        // Agregar efecto de carga
        card.classList.add('loading');
        
        // Determinar qué opción fue seleccionada
        const optionType = this.getOptionType(card);
        
        // Simular carga
        setTimeout(() => {
            card.classList.remove('loading');
            this.navigateToOption(optionType);
        }, 500);
    }
    
    getOptionType(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        
        if (title.includes('crear playlist')) {
            return 'create-playlist';
        } else if (title.includes('administrar')) {
            return 'manage-playlists';
        } else if (title.includes('estadísticas')) {
            return 'statistics';
        } else if (title.includes('karaoke')) {
            return 'karaoke';
        }
        
        return 'unknown';
    }
    
    navigateToOption(optionType) {
        switch (optionType) {
            case 'create-playlist':
                window.location.href = 'create-playlist.html';
                break;
            case 'manage-playlists':
                window.location.href = 'playlists.html';
                break;
            case 'statistics':
                window.location.href = 'statistics.html';
                break;
            case 'karaoke':
                window.location.href = 'karaoke.html';
                break;
            default:
                this.showMessage('Opción no disponible aún', 'warning');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        // Remover mensajes existentes
        const existingMessages = messageContainer.querySelectorAll('.dashboard-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Crear nuevo mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `dashboard-message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
    
    logout() {
        // Limpiar tokens
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
        // Redirigir al login
        window.location.href = '../index.html';
    }
    
    // Método para cargar actividad reciente
    async loadRecentActivity() {
        try {
            // Por ahora, mostrar actividad de ejemplo
            // En el futuro, esto se puede conectar con una API real
            this.updateActivityList();
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }
    
    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Por ahora, mantener la actividad de ejemplo del HTML
        // En el futuro, esto se puede actualizar dinámicamente
    }
}

// ===== GLOBAL FUNCTIONS =====

// Función para navegar a una opción específica
function navigateTo(optionType) {
    if (window.dashboardManager) {
        window.dashboardManager.navigateToOption(optionType);
    }
}

// Función para cerrar sesión
function logout() {
    if (window.dashboardManager) {
        window.dashboardManager.logout();
    }
}

// Función para mostrar mensajes
function showDashboardMessage(message, type = 'info') {
    if (window.dashboardManager) {
        window.dashboardManager.showMessage(message, type);
    }
}

// ===== UTILITY FUNCTIONS =====

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return 'Hace unos minutos';
    } else if (diffInHours < 24) {
        return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-ES');
    }
}

// Función para capitalizar texto
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para truncar texto
function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ===== INITIALIZATION =====

// Inicializar dashboard manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    
    // Cargar actividad reciente
    setTimeout(() => {
        if (window.dashboardManager) {
            window.dashboardManager.loadRecentActivity();
        }
    }, 1000);
});

// Exportar para uso global
window.DashboardManager = DashboardManager;
window.navigateTo = navigateTo;
window.logout = logout;
window.showDashboardMessage = showDashboardMessage; 