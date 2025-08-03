// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard cargado');
    
    // Verificar si el usuario está autenticado
    checkAuthStatus();
    
    // Agregar efectos de hover a las tarjetas
    initializeCardEffects();
});

// Verificar estado de autenticación
function checkAuthStatus() {
    // Verificar si ya tenemos un token válido en localStorage
    const accessToken = localStorage.getItem('spotify_access_token');
    const tokenExpires = localStorage.getItem('spotify_token_expires');

    if (accessToken && tokenExpires) {
        // Verificar si el token ha expirado
        if (Date.now() < parseInt(tokenExpires)) {
            console.log('Token válido, usuario autenticado');
            return; // Usuario autenticado, continuar
        } else {
            // Token expirado - limpiar y redirigir
            console.log('Token expirado, redirigiendo al login');
            logout();
            return;
        }
    }

    // No hay token válido - redirigir al login
    console.log('No hay token válido, redirigiendo al login');
    window.location.href = 'index.html';
}

// Inicializar efectos de las tarjetas
function initializeCardEffects() {
    const cards = document.querySelectorAll('.dashboard-card:not(.disabled)');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        card.addEventListener('click', function() {
            // Agregar efecto de click
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-8px)';
            }, 150);
        });
    });
}

// Navegar a crear playlist (página principal del sitio)
function navigateToCreatePlaylist() {
    console.log('Navegando a crear playlist');
    
    // Agregar efecto de loading
    const card = event.currentTarget;
    card.classList.add('loading');
    
    // Redirigir a la página principal del sitio web
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Navegar a modificar playlists
function navigateToModifyPlaylists() {
    console.log('Navegando a modificar playlists');
    
    // Agregar efecto de loading
    const card = event.currentTarget;
    card.classList.add('loading');
    
    // Por ahora redirigir a una página temporal
    setTimeout(() => {
        window.location.href = 'modify_playlists.html';
    }, 500);
}

// Navegar a estadísticas
function navigateToStatistics() {
    console.log('Navegando a estadísticas');
    
    // Agregar efecto de loading
    const card = event.currentTarget;
    card.classList.add('loading');
    
    // Por ahora redirigir a una página temporal
    setTimeout(() => {
        window.location.href = 'statistics.html';
    }, 500);
}

// Función de logout
function logout() {
    console.log('Cerrando sesión');
    
    // Mostrar confirmación
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
        // Redirigir al sitio web principal
        window.location.href = 'index.html';
    }
}

// Función para obtener el token de acceso
function getAccessToken() {
    return localStorage.getItem('spotify_access_token');
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    const token = getAccessToken();
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    const tokenExpires = localStorage.getItem('spotify_token_expires');
    if (!tokenExpires) return false;
    
    return Date.now() < parseInt(tokenExpires);
}

// Función para hacer llamadas a la API de Spotify
async function callSpotifyAPI(endpoint, options = {}) {
    const token = getAccessToken();
    if (!token) {
        throw new Error('No hay token de acceso');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...defaultOptions,
        ...options
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expirado, redirigir al login
            logout();
            return;
        }
        throw new Error(`Error en la API: ${response.status}`);
    }
    
    return await response.json();
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Agregar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Colores según tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Agregar estilos CSS para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles); 