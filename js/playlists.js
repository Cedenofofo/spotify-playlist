// ===== PLAYLISTS MANAGEMENT =====

class PlaylistsManager {
    constructor() {
        this.playlists = [];
        this.filteredPlaylists = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.accessToken = null;
        
        // Elementos del DOM
        this.loadingState = document.getElementById('loading-state');
        this.playlistsContainer = document.getElementById('playlists-container');
        this.emptyState = document.getElementById('empty-state');
        this.searchInput = document.getElementById('playlist-search');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Modales
        this.editModal = document.getElementById('edit-modal');
        this.confirmModal = document.getElementById('confirm-modal');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAccessToken();
        this.loadPlaylists();
    }
    
    setupEventListeners() {
        // Búsqueda
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterPlaylists();
            });
        }
        
        // Filtros
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterPlaylists();
            });
        });
        
        // Modales
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Modal de edición
        const modalClose = document.getElementById('modal-close');
        const modalCancel = document.getElementById('modal-cancel');
        const modalSave = document.getElementById('modal-save');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeEditModal());
        }
        
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.closeEditModal());
        }
        
        if (modalSave) {
            modalSave.addEventListener('click', () => this.savePlaylistChanges());
        }
        
        // Modal de confirmación
        const confirmClose = document.getElementById('confirm-close');
        const confirmCancel = document.getElementById('confirm-cancel');
        const confirmAction = document.getElementById('confirm-action');
        
        if (confirmClose) {
            confirmClose.addEventListener('click', () => this.closeConfirmModal());
        }
        
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.closeConfirmModal());
        }
        
        if (confirmAction) {
            confirmAction.addEventListener('click', () => this.executeConfirmedAction());
        }
        
        // Cerrar modales al hacer clic fuera
        [this.editModal, this.confirmModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal);
                    }
                });
            }
        });
    }
    
    loadAccessToken() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        
        if (!this.accessToken) {
            this.showMessage('Necesitas autenticarte con Spotify para ver tus playlists', 'warning');
            this.showEmptyState();
            return false;
        }
        
        return true;
    }
    
    async loadPlaylists() {
        if (!this.loadAccessToken()) {
            return;
        }
        
        this.showLoadingState();
        
        try {
            const playlists = await this.fetchUserPlaylists();
            
            if (playlists && playlists.length > 0) {
                this.playlists = playlists;
                this.filteredPlaylists = [...playlists];
                this.renderPlaylists();
                this.hideLoadingState();
            } else {
                this.showEmptyState();
            }
            
        } catch (error) {
            console.error('Error loading playlists:', error);
            this.showMessage('Error al cargar las playlists', 'error');
            this.showEmptyState();
        }
    }
    
    async fetchUserPlaylists() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.items;
            } else if (response.status === 401) {
                // Token expirado
                localStorage.removeItem('spotify_access_token');
                this.showMessage('Sesión expirada. Por favor, vuelve a autenticarte.', 'error');
                return null;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error fetching playlists:', error);
            throw error;
        }
    }
    
    filterPlaylists() {
        this.filteredPlaylists = this.playlists.filter(playlist => {
            const matchesSearch = playlist.name.toLowerCase().includes(this.currentSearch);
            const matchesFilter = this.matchesFilter(playlist);
            return matchesSearch && matchesFilter;
        });
        
        this.renderPlaylists();
    }
    
    matchesFilter(playlist) {
        switch (this.currentFilter) {
            case 'public':
                return playlist.public;
            case 'private':
                return !playlist.public;
            case 'collaborative':
                return playlist.collaborative;
            default:
                return true;
        }
    }
    
    renderPlaylists() {
        if (!this.playlistsContainer) return;
        
        if (this.filteredPlaylists.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        const playlistsHTML = this.filteredPlaylists.map(playlist => 
            this.createPlaylistCard(playlist)
        ).join('');
        
        this.playlistsContainer.innerHTML = playlistsHTML;
        
        // Agregar event listeners a los botones
        this.setupPlaylistCardEvents();
    }
    
    createPlaylistCard(playlist) {
        const imageUrl = playlist.images && playlist.images.length > 0 
            ? playlist.images[0].url 
            : 'https://via.placeholder.com/80x80';
        
        const badges = this.createPlaylistBadges(playlist);
        const stats = this.createPlaylistStats(playlist);
        
        return `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-header">
                    <img src="${imageUrl}" alt="${playlist.name}" class="playlist-image">
                    <div class="playlist-info">
                        <h3 class="playlist-name">${this.escapeHtml(playlist.name)}</h3>
                        <p class="playlist-owner">Por ${this.escapeHtml(playlist.owner.display_name)}</p>
                        <div class="playlist-stats">
                            ${stats}
                        </div>
                    </div>
                </div>
                
                <div class="playlist-badges">
                    ${badges}
                </div>
                
                <div class="playlist-actions">
                    <button class="action-btn view" onclick="playlistsManager.viewPlaylist('${playlist.id}')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="action-btn edit" onclick="playlistsManager.editPlaylist('${playlist.id}')">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="action-btn delete" onclick="playlistsManager.deletePlaylist('${playlist.id}')">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    createPlaylistBadges(playlist) {
        const badges = [];
        
        if (playlist.collaborative) {
            badges.push('<span class="playlist-badge collaborative">Colaborativa</span>');
        } else if (playlist.public) {
            badges.push('<span class="playlist-badge public">Pública</span>');
        } else {
            badges.push('<span class="playlist-badge private">Privada</span>');
        }
        
        return badges.join('');
    }
    
    createPlaylistStats(playlist) {
        return `
            <div class="playlist-stat">
                <i class="fas fa-music"></i>
                <span>${playlist.tracks.total} canciones</span>
            </div>
            <div class="playlist-stat">
                <i class="fas fa-calendar"></i>
                <span>${this.formatDate(playlist.created_at)}</span>
            </div>
        `;
    }
    
    setupPlaylistCardEvents() {
        // Los event listeners se manejan con onclick en el HTML generado
        // para evitar problemas con elementos dinámicos
    }
    
    viewPlaylist(playlistId) {
        // Abrir playlist en Spotify
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            window.open(playlist.external_urls.spotify, '_blank');
        }
    }
    
    editPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        // Llenar el modal con los datos actuales
        document.getElementById('playlist-name').value = playlist.name;
        document.getElementById('playlist-description').value = playlist.description || '';
        document.getElementById('playlist-public').value = playlist.public.toString();
        
        // Guardar el ID de la playlist para la edición
        this.editModal.dataset.playlistId = playlistId;
        
        this.openEditModal();
    }
    
    deletePlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        // Mostrar modal de confirmación
        document.getElementById('confirm-message').textContent = 
            `¿Estás seguro de que quieres eliminar la playlist "${playlist.name}"? Esta acción no se puede deshacer.`;
        
        this.confirmModal.dataset.playlistId = playlistId;
        this.confirmModal.dataset.action = 'delete';
        
        this.openConfirmModal();
    }
    
    async savePlaylistChanges() {
        const playlistId = this.editModal.dataset.playlistId;
        const name = document.getElementById('playlist-name').value.trim();
        const description = document.getElementById('playlist-description').value.trim();
        const isPublic = document.getElementById('playlist-public').value === 'true';
        
        if (!name) {
            this.showMessage('El nombre de la playlist es requerido', 'error');
            return;
        }
        
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    public: isPublic
                })
            });
            
            if (response.ok) {
                // Actualizar la playlist en el array local
                const playlistIndex = this.playlists.findIndex(p => p.id === playlistId);
                if (playlistIndex !== -1) {
                    this.playlists[playlistIndex].name = name;
                    this.playlists[playlistIndex].description = description;
                    this.playlists[playlistIndex].public = isPublic;
                    
                    // Re-renderizar
                    this.filterPlaylists();
                }
                
                this.closeEditModal();
                this.showMessage('Playlist actualizada exitosamente', 'success');
                
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error updating playlist:', error);
            this.showMessage('Error al actualizar la playlist', 'error');
        }
    }
    
    async executeConfirmedAction() {
        const action = this.confirmModal.dataset.action;
        const playlistId = this.confirmModal.dataset.playlistId;
        
        if (action === 'delete') {
            await this.performDeletePlaylist(playlistId);
        }
        
        this.closeConfirmModal();
    }
    
    async performDeletePlaylist(playlistId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                // Remover de los arrays locales
                this.playlists = this.playlists.filter(p => p.id !== playlistId);
                this.filteredPlaylists = this.filteredPlaylists.filter(p => p.id !== playlistId);
                
                // Re-renderizar
                this.renderPlaylists();
                
                this.showMessage('Playlist eliminada exitosamente', 'success');
                
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error deleting playlist:', error);
            this.showMessage('Error al eliminar la playlist', 'error');
        }
    }
    
    // Métodos de utilidad para modales
    openEditModal() {
        this.editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeEditModal() {
        this.editModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    openConfirmModal() {
        this.confirmModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeConfirmModal() {
        this.confirmModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Estados de la interfaz
    showLoadingState() {
        if (this.loadingState) {
            this.loadingState.style.display = 'block';
        }
        if (this.playlistsContainer) {
            this.playlistsContainer.style.display = 'none';
        }
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }
    
    hideLoadingState() {
        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }
        if (this.playlistsContainer) {
            this.playlistsContainer.style.display = 'grid';
        }
    }
    
    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
        if (this.playlistsContainer) {
            this.playlistsContainer.style.display = 'none';
        }
        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }
    }
    
    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }
    
    // Mensajes
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
    
    // Utilidades
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// ===== INITIALIZATION =====

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.playlistsManager = new PlaylistsManager();
});

// Exportar para uso global
window.PlaylistsManager = PlaylistsManager; 