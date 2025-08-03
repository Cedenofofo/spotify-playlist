// ===== NAVBAR FUNCTIONALITY =====

class Navbar {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navbarToggle = document.getElementById('navbar-toggle');
        this.navbarMenu = document.querySelector('.navbar-menu');
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserInfo();
        this.setupScrollEffects();
        this.setActivePage();
    }
    
    setupEventListeners() {
        // Toggle del menú móvil
        if (this.navbarToggle) {
            this.navbarToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Cerrar menú al hacer clic en un enlace
        const navbarLinks = document.querySelectorAll('.navbar-link');
        navbarLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Manejar tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.navbarToggle.classList.toggle('active');
        this.navbarMenu.classList.toggle('active');
        
        // Animar el toggle
        const spans = this.navbarToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transition = 'all 0.3s ease';
        });
    }
    
    closeMobileMenu() {
        this.navbarToggle.classList.remove('active');
        this.navbarMenu.classList.remove('active');
    }
    
    setupScrollEffects() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Efecto de scroll para el navbar
            if (scrollTop > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Ocultar/mostrar navbar en scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    setActivePage() {
        const currentPath = window.location.pathname;
        const navbarLinks = document.querySelectorAll('.navbar-link');
        
        navbarLinks.forEach(link => {
            link.classList.remove('active');
            
            // Determinar la página activa
            if (currentPath.includes('playlists.html') && link.href.includes('playlists.html')) {
                link.classList.add('active');
            } else if (currentPath.includes('index.html') || currentPath.endsWith('/') && link.href.includes('index.html')) {
                link.classList.add('active');
            } else if (currentPath.includes('search.html') && link.href.includes('search.html')) {
                link.classList.add('active');
            } else if (currentPath.includes('stats.html') && link.href.includes('stats.html')) {
                link.classList.add('active');
            } else if (currentPath.includes('settings.html') && link.href.includes('settings.html')) {
                link.classList.add('active');
            }
        });
    }
    
    async loadUserInfo() {
        try {
            // Verificar si hay token de acceso
            const accessToken = this.getAccessToken();
            
            if (!accessToken) {
                this.showGuestUser();
                return;
            }
            
            // Obtener información del usuario desde Spotify
            const userInfo = await this.fetchUserInfo(accessToken);
            
            if (userInfo) {
                this.updateUserInfo(userInfo);
            } else {
                this.showGuestUser();
            }
            
        } catch (error) {
            console.error('Error loading user info:', error);
            this.showGuestUser();
        }
    }
    
    getAccessToken() {
        // Obtener token del localStorage o URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token') || localStorage.getItem('spotify_access_token');
        
        if (accessToken) {
            localStorage.setItem('spotify_access_token', accessToken);
            return accessToken;
        }
        
        return null;
    }
    
    async fetchUserInfo(accessToken) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Token expirado, limpiar
                localStorage.removeItem('spotify_access_token');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }
    
    updateUserInfo(userInfo) {
        if (this.userAvatar) {
            if (userInfo.images && userInfo.images.length > 0) {
                this.userAvatar.src = userInfo.images[0].url;
            } else {
                this.userAvatar.src = 'https://via.placeholder.com/32x32';
            }
        }
        
        if (this.userName) {
            this.userName.textContent = userInfo.display_name || 'Usuario';
        }
    }
    
    showGuestUser() {
        if (this.userAvatar) {
            this.userAvatar.src = 'https://via.placeholder.com/32x32';
        }
        
        if (this.userName) {
            this.userName.textContent = 'Invitado';
        }
    }
    
    // Método para mostrar notificaciones en el navbar
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `navbar-notification navbar-notification-${type}`;
        notification.textContent = message;
        
        // Agregar al navbar
        this.navbar.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Método para actualizar el estado de carga
    setLoadingState(loading) {
        if (loading) {
            this.navbar.classList.add('navbar-loading');
        } else {
            this.navbar.classList.remove('navbar-loading');
        }
    }
}

// ===== UTILITY FUNCTIONS =====

// Función para navegar entre páginas con transiciones suaves
function navigateToPage(url) {
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent) {
        // Agregar clase de transición
        mainContent.classList.add('page-transition');
        
        // Navegar después de la transición
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {
        window.location.href = url;
    }
}

// Función para manejar la autenticación
function handleAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Procesar código de autorización
        exchangeCodeForToken(code);
    }
}

// Función para intercambiar código por token
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch('/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                
                // Limpiar URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Recargar información del usuario
                if (window.navbar) {
                    window.navbar.loadUserInfo();
                }
            }
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
    }
}

// ===== INITIALIZATION =====

// Inicializar navbar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navbar = new Navbar();
    
    // Manejar autenticación si es necesario
    handleAuth();
    
    // Agregar clase loaded para animaciones
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Exportar para uso global
window.Navbar = Navbar;
window.navigateToPage = navigateToPage; 