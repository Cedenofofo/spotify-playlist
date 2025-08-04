// Dashboard JavaScript Elegante
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard elegante cargado');
    checkAuthStatus();
    initHoverEffects();
    initEntranceAnimations();
    initParticleEffects();
});

// Verificar estado de autenticación
function checkAuthStatus() {
    const accessToken = localStorage.getItem('spotify_access_token');
    const tokenExpires = localStorage.getItem('spotify_token_expires');

    if (accessToken && tokenExpires) {
        if (Date.now() < parseInt(tokenExpires)) {
            console.log('Token válido, usuario autenticado');
            return;
        } else {
            console.log('Token expirado, redirigiendo al login');
            logout();
            return;
        }
    }
    console.log('No hay token válido, redirigiendo al login');
    window.location.href = 'index.html';
}

// Cursor personalizado - Removed

// Efectos de hover en tarjetas de acción
function initHoverEffects() {
    const actionCards = document.querySelectorAll('.action-card:not(.disabled)');
    
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const glow = this.querySelector('.card-glow');
            const icon = this.querySelector('.icon-container');
            const particles = this.querySelectorAll('.particle');
            
            if (glow) glow.style.opacity = '0.2';
            if (icon) icon.style.transform = 'scale(1.1)';
            
            particles.forEach((particle, index) => {
                particle.style.animationDelay = `${index * 0.1}s`;
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const glow = this.querySelector('.card-glow');
            const icon = this.querySelector('.icon-container');
            
            if (glow) glow.style.opacity = '0';
            if (icon) icon.style.transform = 'scale(1)';
        });
    });
}

// Animaciones de entrada
function initEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.welcome-card, .action-card, .section-header');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Efectos de partículas
function initParticleEffects() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 1}s`;
    });
}

// Navegar a crear playlist (formulario en index.html)
function navigateToCreatePlaylist() {
    console.log('Navegando a crear playlist');
    
    // Agregar efecto de loading
    const card = event.currentTarget;
    if (card) {
        card.classList.add('loading');
    }
    
    // Redirigir al formulario de crear playlist en index.html
    setTimeout(() => {
        console.log('Redirigiendo a index.html#playlist-section');
        window.location.href = 'index.html#playlist-section';
    }, 500);
}

// Navegar a modificar playlists
function navigateToModifyPlaylists() {
    console.log('Navegando a modificar playlists');
    
    // Agregar efecto de loading
    const card = event.currentTarget;
    card.classList.add('loading');
    
    // Redirigir a la página de modificar playlists
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
    
    // Redirigir a la página de estadísticas
    setTimeout(() => {
        window.location.href = 'statistics.html';
    }, 500);
}

// Función de logout mejorada
function logout() {
    console.log('Cerrando sesión');
    const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmed) {
        // Efecto de salida
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
        document.body.style.transition = 'all 0.3s ease';
        
        // Limpiar localStorage
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
        // Redirigir después de la animación
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }
}

// Hacer la función logout global
window.logout = logout;

// Función para obtener el token de acceso
function getAccessToken() {
    return localStorage.getItem('spotify_access_token');
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    const token = getAccessToken();
    if (!token) return false;
    
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
            logout();
            return;
        }
        throw new Error(`Error en la API: ${response.status}`);
    }
    
    return await response.json();
}

// Función para mostrar notificaciones elegantes
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos elegantes
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    // Colores según tipo
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Contenido de la notificación
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Agregar estilos CSS para las notificaciones elegantes
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
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