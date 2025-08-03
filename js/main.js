// ===== ELEGANT MAIN JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Tuneuptify elegante cargado');
    
    // Inicializar todas las funcionalidades elegantes
    initCustomCursor();
    initEntranceAnimations();
    initParticleEffects();
    initFormInteractions();
    
    // Configurar eventos de autenticación
    setupAuthEvents();
    
    // Configurar eventos de formulario
    setupFormEvents();
    
    // Verificar si viene del dashboard para mostrar el formulario de crear playlist
    checkHashAndShowPlaylistForm();
});

// ===== CURSOR PERSONALIZADO =====
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (!cursor || !follower) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 50);
    });
    
    // Efectos de hover
    const interactiveElements = document.querySelectorAll('button, .action-card, .stat-card, .social-link, .hero-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            follower.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
        });
    });
}

// ===== ANIMACIONES DE ENTRADA =====
function initEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.welcome-card, .hero-features, .playlist-form-container, .section-header');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// ===== EFECTOS DE PARTÍCULAS =====
function initParticleEffects() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 1}s`;
    });
}

// ===== INTERACCIONES DE FORMULARIO =====
function initFormInteractions() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.style.transform = 'scale(1.02)';
                wrapper.style.boxShadow = '0 0 0 3px rgba(29, 185, 84, 0.2)';
            }
        });
        
        input.addEventListener('blur', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.style.transform = 'scale(1)';
                wrapper.style.boxShadow = 'none';
            }
        });
    });
}

// ===== CONFIGURACIÓN DE AUTENTICACIÓN =====
function setupAuthEvents() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            // Efecto de ripple
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
            
            // Efecto de salida
            document.body.style.opacity = '0';
            document.body.style.transform = 'scale(0.95)';
            document.body.style.transition = 'all 0.3s ease';
            
            // Llamar a la función de login
            setTimeout(() => {
                if (window.auth && window.auth.login) {
                    window.auth.login();
                }
            }, 300);
        });
    }
}

// ===== CONFIGURACIÓN DE FORMULARIO =====
function setupFormEvents() {
    const buttons = ['#add-artist', '#preview-playlist', '#export-spotify'];
    
    buttons.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener('click', function(e) {
                // Efecto de ripple
                const ripple = this.querySelector('.btn-ripple');
                if (ripple) {
                    ripple.style.width = '300px';
                    ripple.style.height = '300px';
                    setTimeout(() => {
                        ripple.style.width = '0';
                        ripple.style.height = '0';
                    }, 600);
                }
            });
        }
    });
}

// ===== VERIFICAR HASH Y MOSTRAR FORMULARIO =====
function checkHashAndShowPlaylistForm() {
    // Verificar si hay un hash en la URL
    if (window.location.hash === '#playlist-section') {
        console.log('Detectado hash #playlist-section, mostrando formulario de crear playlist');
        
        // Ocultar las secciones principales
        const heroSection = document.querySelector('.hero-parallax');
        const featuresSection = document.querySelector('.features-section');
        
        if (heroSection) heroSection.style.display = 'none';
        if (featuresSection) featuresSection.style.display = 'none';
        
        // Mostrar la sección de playlist
        const playlistSection = document.getElementById('playlist-section');
        if (playlistSection) {
            playlistSection.style.display = 'block';
            
            // Scroll suave hacia el formulario
            setTimeout(() => {
                playlistSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
            
            // Agregar animación de entrada
            playlistSection.style.opacity = '0';
            playlistSection.style.transform = 'translateY(30px)';
            playlistSection.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                playlistSection.style.opacity = '1';
                playlistSection.style.transform = 'translateY(0)';
            }, 200);
        }
        
        // Limpiar el hash de la URL sin recargar la página
        history.replaceState(null, null, window.location.pathname);
    }
}

// ===== FUNCIONES AUXILIARES =====
function addArtistInput() {
    const artistInputs = document.getElementById('artist-inputs');
    const newRow = document.createElement('div');
    newRow.className = 'artist-row';
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateX(-20px)';
    newRow.style.transition = 'all 0.3s ease';
    
    newRow.innerHTML = `
        <input type="text" class="form-input" placeholder="Nombre del artista adicional">
        <button type="button" class="remove-artist-btn" onclick="removeArtist(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    artistInputs.appendChild(newRow);
    
    // Animación de entrada
    setTimeout(() => {
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateX(0)';
    }, 50);
}

function removeArtist(button) {
    const row = button.closest('.artist-row');
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        row.remove();
    }, 300);
}

function showLoadingAnimation() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
        loading.style.opacity = '0';
        loading.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            loading.style.opacity = '1';
            loading.style.transform = 'scale(1)';
        }, 50);
    }
}

function hideLoadingAnimation() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            loading.style.display = 'none';
        }, 300);
    }
}

function showNotification(message, type = 'success') {
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

// ===== FUNCIONES GLOBALES =====
window.addArtistInput = addArtistInput;
window.removeArtist = removeArtist;
window.showNotification = showNotification;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation; 