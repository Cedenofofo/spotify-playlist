// ===== MODIFY PLAYLISTS MANAGER =====

class ModifyPlaylistsManager {
    constructor() {
        this.auth = new Auth();
        this.playlists = [];
        this.filteredPlaylists = [];
        this.setupEventListeners();
        this.checkAuth();
        console.log('ModifyPlaylistsManager inicializado');
    }

    setupEventListeners() {
        // Event listener para búsqueda de playlists
        const searchInput = document.getElementById('search-playlists');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim().toLowerCase();
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.filterPlaylists(query);
                }, 300);
            });
        }

        // Cursor personalizado
        this.initCustomCursor();
    }

    initCustomCursor() {
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
        const interactiveElements = document.querySelectorAll('button, .playlist-card, .action-btn');
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

    checkAuth() {
        const token = localStorage.getItem('spotify_access_token');
        const tokenExpires = localStorage.getItem('spotify_token_expires');

        if (token && tokenExpires && Date.now() < parseInt(tokenExpires)) {
            console.log('Usuario autenticado, cargando playlists');
            this.loadPlaylists();
        } else {
            console.log('Usuario no autenticado, redirigiendo al login');
            window.location.href = 'index.html';
        }
    }

    async loadPlaylists() {
        this.showLoadingState();
        
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Obtener playlists del usuario - aumentar el límite y usar paginación
            let allPlaylists = [];
            let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
            let pageCount = 0;
            
            // Actualizar mensaje de carga
            const loadingElement = document.querySelector('#loading-state h3');
            
            while (nextUrl) {
                pageCount++;
                if (loadingElement) {
                    loadingElement.textContent = `Cargando tus playlists... (página ${pageCount})`;
                }
                
                const response = await fetch(nextUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expirado, redirigir al login
                        this.auth.logout();
                        return;
                    }
                    throw new Error(`Error en la API: ${response.status}`);
                }

                const data = await response.json();
                allPlaylists = allPlaylists.concat(data.items || []);
                nextUrl = data.next; // URL para la siguiente página
                
                // Pequeña pausa para no sobrecargar la API
                if (nextUrl) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            this.playlists = allPlaylists;
            this.filteredPlaylists = [...this.playlists];

            console.log(`Se cargaron ${this.playlists.length} playlists`);

            if (this.playlists.length === 0) {
                this.showEmptyState();
            } else {
                this.displayPlaylists();
                this.showNotification(`Se cargaron ${this.playlists.length} playlists`, 'success');
            }

        } catch (error) {
            console.error('Error al cargar playlists:', error);
            this.showErrorState();
        }
    }

    filterPlaylists(query) {
        if (!query) {
            this.filteredPlaylists = [...this.playlists];
        } else {
            this.filteredPlaylists = this.playlists.filter(playlist => 
                playlist.name.toLowerCase().includes(query) ||
                playlist.description?.toLowerCase().includes(query)
            );
        }
        
        this.displayPlaylists();
    }

    displayPlaylists() {
        const grid = document.getElementById('playlists-grid');
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const emptyState = document.getElementById('empty-state');

        // Ocultar todos los estados
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        emptyState.style.display = 'none';

        if (this.filteredPlaylists.length === 0) {
            if (this.playlists.length === 0) {
                this.showEmptyState();
            } else {
                // No hay resultados de búsqueda
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>No se encontraron playlists</h3>
                        <p>Intenta con otros términos de búsqueda.</p>
                    </div>
                `;
                grid.style.display = 'grid';
            }
            return;
        }

        grid.innerHTML = this.filteredPlaylists.map(playlist => this.createPlaylistCard(playlist)).join('');
        grid.style.display = 'grid';

        // Agregar event listeners a los botones
        this.setupPlaylistCardListeners();
    }

    createPlaylistCard(playlist) {
        const imageUrl = playlist.images[0]?.url || 'https://via.placeholder.com/80x80?text=🎵';
        const trackCount = playlist.tracks?.total || 0;
        const isPublic = playlist.public ? 'Pública' : 'Privada';
        const owner = playlist.owner?.display_name || 'Usuario';
        
        // Truncar nombres muy largos del propietario
        const truncatedOwner = owner.length > 15 ? owner.substring(0, 15) + '...' : owner;

        return `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-header">
                    <img src="${imageUrl}" alt="${playlist.name}" class="playlist-image">
                    <div class="playlist-info">
                        <h3 title="${this.escapeHtml(playlist.name)}">${this.escapeHtml(playlist.name)}</h3>
                        <p title="${this.escapeHtml(playlist.description || 'Sin descripción')}">${this.escapeHtml(playlist.description || 'Sin descripción')}</p>
                    </div>
                </div>
                
                <div class="playlist-stats">
                    <div class="stat-item">
                        <span class="stat-value">${trackCount}</span>
                        <span class="stat-label">Canciones</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${isPublic}</span>
                        <span class="stat-label">Estado</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" title="${this.escapeHtml(owner)}">${this.escapeHtml(truncatedOwner)}</span>
                        <span class="stat-label">Propietario</span>
                    </div>
                </div>
                
                <div class="playlist-actions">
                    <button class="action-btn btn-view" onclick="modifyPlaylistsManager.viewPlaylist('${playlist.id}')" title="Ver playlist">
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                    <button class="action-btn btn-edit" onclick="modifyPlaylistsManager.editPlaylist('${playlist.id}')" title="Editar playlist">
                        <i class="fas fa-edit"></i>
                        <span>Editar</span>
                    </button>
                    <button class="action-btn btn-delete" onclick="modifyPlaylistsManager.deletePlaylist('${playlist.id}', '${this.escapeHtml(playlist.name)}')" title="Eliminar playlist">
                        <i class="fas fa-trash"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupPlaylistCardListeners() {
        // Los event listeners se configuran directamente en los botones
        // para evitar problemas con elementos dinámicos
    }

    async viewPlaylist(playlistId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Obtener detalles de la playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener playlist: ${response.status}`);
            }

            const playlist = await response.json();
            
            // Mostrar modal con detalles de la playlist
            this.showPlaylistDetailsModal(playlist);

        } catch (error) {
            console.error('Error al ver playlist:', error);
            this.showNotification('Error al cargar la playlist', 'error');
        }
    }

    async editPlaylist(playlistId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Obtener detalles de la playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener playlist: ${response.status}`);
            }

            const playlist = await response.json();
            
            // Mostrar modal de edición
            this.showEditPlaylistModal(playlist);

        } catch (error) {
            console.error('Error al editar playlist:', error);
            this.showNotification('Error al cargar la playlist', 'error');
        }
    }

    async deletePlaylist(playlistId, playlistName) {
        const confirmed = confirm(`¿Estás seguro de que quieres eliminar la playlist "${playlistName}"?\n\nEsta acción no se puede deshacer.`);
        
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Eliminar playlist (unfollow para playlists públicas, eliminar para privadas)
            const playlist = this.playlists.find(p => p.id === playlistId);
            if (!playlist) {
                throw new Error('Playlist no encontrada');
            }

            if (playlist.public) {
                // Para playlists públicas, hacer unfollow
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al eliminar playlist: ${response.status}`);
                }
            } else {
                // Para playlists privadas, eliminar directamente
                // Nota: Spotify no permite eliminar playlists directamente via API
                // Solo se puede hacer unfollow
                this.showNotification('Las playlists privadas no se pueden eliminar desde la API de Spotify', 'warning');
                return;
            }

            // Remover de la lista local
            this.playlists = this.playlists.filter(p => p.id !== playlistId);
            this.filteredPlaylists = this.filteredPlaylists.filter(p => p.id !== playlistId);
            
            this.displayPlaylists();
            this.showNotification('Playlist eliminada exitosamente', 'success');

        } catch (error) {
            console.error('Error al eliminar playlist:', error);
            this.showNotification('Error al eliminar la playlist', 'error');
        }
    }

    showPlaylistDetailsModal(playlist) {
        const tracks = playlist.tracks?.items || [];
        const tracksHtml = tracks.map((item, index) => {
            const track = item.track;
            return `
                <div class="track-item" style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #b3b3b3; min-width: 30px;">${index + 1}</span>
                    <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/40x40?text=🎵'}" 
                         style="width: 40px; height: 40px; border-radius: 4px;" alt="${track.album.name}">
                    <div style="flex: 1;">
                        <div style="color: #ffffff; font-weight: 500;">${this.escapeHtml(track.name)}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">${this.escapeHtml(track.artists.map(a => a.name).join(', '))}</div>
                    </div>
                </div>
            `;
        }).join('');

        const modalHtml = `
            <div id="playlist-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
                align-items: center; justify-content: center; padding: 2rem;">
                <div style="
                    background: #1a1a1a; border-radius: 20px; padding: 2rem; 
                    max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="color: #ffffff; margin: 0;">${this.escapeHtml(playlist.name)}</h2>
                        <button onclick="this.closest('#playlist-modal').remove()" 
                                style="background: none; border: none; color: #b3b3b3; font-size: 1.5rem; cursor: pointer;">×</button>
                    </div>
                    <p style="color: #b3b3b3; margin-bottom: 1rem;">${this.escapeHtml(playlist.description || 'Sin descripción')}</p>
                    <div style="margin-bottom: 1rem;">
                        <span style="color: #1db954; font-weight: 600;">${tracks.length} canciones</span>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${tracksHtml}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    showEditPlaylistModal(playlist) {
        const modalHtml = `
            <div id="edit-playlist-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
                align-items: center; justify-content: center; padding: 2rem;">
                <div style="
                    background: #1a1a1a; border-radius: 20px; padding: 2rem; 
                    max-width: 500px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="color: #ffffff; margin: 0;">Editar Playlist</h2>
                        <button onclick="this.closest('#edit-playlist-modal').remove()" 
                                style="background: none; border: none; color: #b3b3b3; font-size: 1.5rem; cursor: pointer;">×</button>
                    </div>
                    <form id="edit-playlist-form">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ffffff; margin-bottom: 0.5rem;">Nombre:</label>
                            <input type="text" id="edit-playlist-name" value="${this.escapeHtml(playlist.name)}" 
                                   style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #333; background: #2a2a2a; color: #ffffff;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ffffff; margin-bottom: 0.5rem;">Descripción:</label>
                            <textarea id="edit-playlist-description" rows="3" 
                                      style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #333; background: #2a2a2a; color: #ffffff; resize: vertical;">${this.escapeHtml(playlist.description || '')}</textarea>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; color: #ffffff;">
                                <input type="checkbox" id="edit-playlist-public" ${playlist.public ? 'checked' : ''} 
                                       style="margin-right: 0.5rem;">
                                Playlist pública
                            </label>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" style="
                                flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #1db954, #1ed760); 
                                color: white; border: none; border-radius: 8px; cursor: pointer;">Guardar</button>
                            <button type="button" onclick="this.closest('#edit-playlist-modal').remove()" style="
                                flex: 1; padding: 0.75rem; background: #333; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Event listener para el formulario
        document.getElementById('edit-playlist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePlaylistChanges(playlist.id);
        });
    }

    async savePlaylistChanges(playlistId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            const name = document.getElementById('edit-playlist-name').value.trim();
            const description = document.getElementById('edit-playlist-description').value.trim();
            const isPublic = document.getElementById('edit-playlist-public').checked;

            if (!name) {
                this.showNotification('El nombre de la playlist es requerido', 'error');
                return;
            }

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    public: isPublic
                })
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar playlist: ${response.status}`);
            }

            // Actualizar en la lista local
            const playlistIndex = this.playlists.findIndex(p => p.id === playlistId);
            if (playlistIndex !== -1) {
                this.playlists[playlistIndex].name = name;
                this.playlists[playlistIndex].description = description;
                this.playlists[playlistIndex].public = isPublic;
            }

            // Cerrar modal y actualizar vista
            document.getElementById('edit-playlist-modal').remove();
            this.displayPlaylists();
            this.showNotification('Playlist actualizada exitosamente', 'success');

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.showNotification('Error al actualizar la playlist', 'error');
        }
    }

    showLoadingState() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('playlists-grid').style.display = 'none';
    }

    showErrorState() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'flex';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('playlists-grid').style.display = 'none';
    }

    showEmptyState() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('empty-state').style.display = 'flex';
        document.getElementById('playlists-grid').style.display = 'none';
    }

    showNotification(message, type = 'info') {
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Función global para volver al dashboard
function goBack() {
    window.location.href = 'dashboard.html';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.modifyPlaylistsManager = new ModifyPlaylistsManager();
});

// Agregar estilos CSS para las notificaciones
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