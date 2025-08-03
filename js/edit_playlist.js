class EditPlaylistManager {
    constructor() {
        this.auth = new Auth();
        this.playlistId = null;
        this.playlist = null;
        this.tracks = [];
        this.searchTimeout = null;
        this.pendingChanges = {
            tracksToRemove: [],
            tracksToAdd: [],
            infoChanges: null
        };
        this.setupEventListeners();
        this.loadPlaylistData();
    }

    setupEventListeners() {
        // Formulario de edición
        document.getElementById('edit-playlist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePlaylistChanges();
        });

        // Botón cancelar
        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.location.href = 'modify_playlists.html';
        });

        // Búsqueda de canciones
        const trackSearch = document.getElementById('track-search');
        trackSearch.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchTracks(e.target.value);
            }, 300);
        });

        // Cerrar sugerencias al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-container')) {
                this.hideSuggestions();
            }
        });
    }

    async loadPlaylistData() {
        try {
            // Obtener playlist ID de la URL
            const urlParams = new URLSearchParams(window.location.search);
            this.playlistId = urlParams.get('id');
            
            if (!this.playlistId) {
                this.showError('No se especificó ID de playlist');
                return;
            }

            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            // Cargar información de la playlist
            const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!playlistResponse.ok) {
                throw new Error(`Error al cargar playlist: ${playlistResponse.status}`);
            }

            this.playlist = await playlistResponse.json();
            this.displayPlaylistInfo();
            this.loadPlaylistTracks();

        } catch (error) {
            console.error('Error al cargar playlist:', error);
            this.showError('Error al cargar la playlist');
        }
    }

    displayPlaylistInfo() {
        // Imagen de la playlist
        const playlistImage = document.getElementById('playlist-image');
        playlistImage.src = this.playlist.images[0]?.url || 'https://via.placeholder.com/120x120?text=🎵';

        // Nombre de la playlist
        document.getElementById('playlist-name').textContent = this.playlist.name;
        document.getElementById('edit-playlist-name').value = this.playlist.name;

        // Descripción
        const description = this.playlist.description || '';
        document.getElementById('playlist-description').textContent = description;
        document.getElementById('edit-playlist-description').value = description;

        // Estadísticas
        document.getElementById('tracks-count').textContent = this.playlist.tracks?.total || 0;
        
        // Duración (calculada)
        const totalDuration = this.playlist.tracks?.items?.reduce((total, item) => {
            return total + (item.track?.duration_ms || 0);
        }, 0) || 0;
        
        const durationMinutes = Math.floor(totalDuration / 60000);
        const durationHours = Math.floor(durationMinutes / 60);
        const remainingMinutes = durationMinutes % 60;
        
        let durationText = '';
        if (durationHours > 0) {
            durationText = `${durationHours}h ${remainingMinutes}m`;
        } else {
            durationText = `${durationMinutes}m`;
        }
        
        document.getElementById('playlist-duration').textContent = durationText;
        
        // Visibilidad
        const visibility = this.playlist.public ? 'Pública' : 'Privada';
        document.getElementById('playlist-visibility').textContent = visibility;
        document.getElementById('public-playlist').checked = this.playlist.public;
    }

    async loadPlaylistTracks() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            let allTracks = [];
            let nextUrl = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks?limit=100`;

            // Cargar todas las canciones de la playlist
            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar canciones: ${response.status}`);
                }

                const data = await response.json();
                allTracks = allTracks.concat(data.items);
                nextUrl = data.next;
            }

            // Filtrar canciones eliminadas localmente
            this.tracks = allTracks.filter(track => 
                !this.pendingChanges.tracksToRemove.includes(track.track.id)
            );

            this.displayTracks();
            this.updateTrackCount();

        } catch (error) {
            console.error('Error al cargar canciones:', error);
            this.showError('Error al cargar las canciones');
        }
    }

    displayTracks() {
        const tracksContainer = document.getElementById('tracks-list');
        tracksContainer.innerHTML = '';

        if (this.tracks.length === 0) {
            tracksContainer.innerHTML = '<p class="no-tracks">No hay canciones en esta playlist</p>';
            return;
        }

        this.tracks.forEach((item, index) => {
            const track = item.track;
            if (!track) return;

            const trackElement = document.createElement('div');
            trackElement.className = 'track-item';
            trackElement.innerHTML = `
                <div class="track-info">
                    <span class="track-number">${index + 1}</span>
                    <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/40x40'}" alt="Album cover" class="track-image">
                    <div class="track-details">
                        <div class="track-name">${this.escapeHtml(track.name)}</div>
                        <div class="track-artist">${track.artists.map(artist => this.escapeHtml(artist.name)).join(', ')}</div>
                    </div>
                </div>
                <div class="track-actions">
                    <button class="action-btn remove" onclick="editPlaylistManager.removeTrack('${track.id}')" title="Eliminar canción">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            tracksContainer.appendChild(trackElement);
        });
    }

    async searchTracks(query) {
        if (!query.trim()) {
            this.hideSuggestions();
            return;
        }

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en búsqueda: ${response.status}`);
            }

            const data = await response.json();
            this.displaySearchSuggestions(data.tracks.items);

        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    }

    displaySearchSuggestions(tracks) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        suggestionsContainer.innerHTML = '';

        if (tracks.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No se encontraron canciones</div>';
            suggestionsContainer.style.display = 'block';
            return;
        }

        tracks.forEach(track => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/30x30'}" alt="Album cover">
                <div class="suggestion-info">
                    <div class="suggestion-name">${this.escapeHtml(track.name)}</div>
                    <div class="suggestion-artist">${track.artists.map(artist => this.escapeHtml(artist.name)).join(', ')}</div>
                </div>
                <button class="add-track-btn" onclick="editPlaylistManager.addTrack('${track.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        suggestionsContainer.style.display = 'none';
    }

    async addTrack(trackId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Verificar si la canción ya está en la playlist
            const existingTrack = this.tracks.find(item => item.track.id === trackId);
            if (existingTrack) {
                this.showNotification('Esta canción ya está en la playlist', 'warning');
                return;
            }

            // Obtener información de la canción
            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener información de la canción: ${response.status}`);
            }

            const track = await response.json();
            
            // Agregar a la lista local
            this.tracks.push({ track: track });
            this.pendingChanges.tracksToAdd.push(trackId);
            
            // Actualizar display
            this.displayTracks();
            this.updateTrackCount();
            this.hideSuggestions();
            
            // Limpiar búsqueda
            document.getElementById('track-search').value = '';

            console.log('Canción agregada. Total actual:', this.tracks.length);
            this.showNotification('Canción agregada a la playlist (cambios pendientes)', 'success');

        } catch (error) {
            console.error('Error al agregar canción:', error);
            this.showError('Error al agregar la canción');
        }
    }

    removeTrack(trackId) {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar esta canción de la playlist?');
        
        if (!confirmed) return;

        try {
            // Encontrar la canción en la lista local
            const trackIndex = this.tracks.findIndex(item => item.track.id === trackId);
            if (trackIndex === -1) {
                this.showError('Canción no encontrada');
                return;
            }

            // Remover de la lista local
            this.tracks.splice(trackIndex, 1);
            
            // Agregar a la lista de cambios pendientes
            this.pendingChanges.tracksToRemove.push(trackId);
            
            // Actualizar display
            this.displayTracks();
            this.updateTrackCount();

            console.log('Canción eliminada. Total actual:', this.tracks.length);
            this.showNotification('Canción eliminada (cambios pendientes)', 'success');

        } catch (error) {
            console.error('Error al eliminar canción:', error);
            this.showError('Error al eliminar la canción');
        }
    }

    updateTrackCount() {
        const tracksCount = document.getElementById('tracks-count');
        if (tracksCount) {
            tracksCount.textContent = this.tracks.length;
            console.log('Contador actualizado:', this.tracks.length, 'canciones');
        } else {
            console.error('Elemento tracks-count no encontrado');
        }
    }

    async savePlaylistChanges() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            const name = document.getElementById('edit-playlist-name').value.trim();
            const description = document.getElementById('edit-playlist-description').value.trim();
            const isPublic = document.getElementById('public-playlist').checked;

            if (!name) {
                this.showError('El nombre de la playlist es requerido');
                return;
            }

            // Actualizar información de la playlist
            const infoResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}`, {
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

            if (!infoResponse.ok) {
                throw new Error(`Error al actualizar información de playlist: ${infoResponse.status}`);
            }

            // Eliminar canciones si hay cambios pendientes
            if (this.pendingChanges.tracksToRemove.length > 0) {
                const removeResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tracks: this.pendingChanges.tracksToRemove.map(id => ({ uri: `spotify:track:${id}` }))
                    })
                });

                if (!removeResponse.ok) {
                    throw new Error(`Error al eliminar canciones: ${removeResponse.status}`);
                }
            }

            // Agregar canciones si hay cambios pendientes
            if (this.pendingChanges.tracksToAdd.length > 0) {
                const addResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: this.pendingChanges.tracksToAdd.map(id => `spotify:track:${id}`)
                    })
                });

                if (!addResponse.ok) {
                    throw new Error(`Error al agregar canciones: ${addResponse.status}`);
                }
            }

            // Actualizar información en la página
            document.getElementById('playlist-name').textContent = name;
            document.getElementById('playlist-description').textContent = description;
            document.getElementById('playlist-visibility').textContent = isPublic ? 'Pública' : 'Privada';

            // Limpiar cambios pendientes
            this.pendingChanges = {
                tracksToRemove: [],
                tracksToAdd: [],
                infoChanges: null
            };

            this.showNotification('Playlist actualizada exitosamente', 'success');

            // Redirigir después de un momento
            setTimeout(() => {
                window.location.href = 'modify_playlists.html';
            }, 1500);

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.showError('Error al guardar los cambios');
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            padding: 1rem 1.5rem; border-radius: 10px; 
            color: white; font-weight: 500; z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

        // Configurar colores según tipo
        switch (type) {
            case 'success':
                notification.style.background = '#2ecc71';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            case 'warning':
                notification.style.background = '#f39c12';
                break;
            default:
                notification.style.background = '#3498db';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.editPlaylistManager = new EditPlaylistManager();
}); 