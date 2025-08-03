class EditPlaylistManager {
    constructor() {
        this.auth = new Auth();
        this.playlistId = null;
        this.playlist = null;
        this.tracks = [];
        this.searchTimeout = null;
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
        document.getElementById('playlist-visibility').textContent = this.playlist.public ? 'Pública' : 'Privada';
        
        // Radio buttons
        if (this.playlist.public) {
            document.getElementById('public-playlist').checked = true;
        } else {
            document.getElementById('private-playlist').checked = true;
        }
    }

    async loadPlaylistTracks() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Cargar todas las canciones de la playlist
            let allTracks = [];
            let nextUrl = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks?limit=100`;

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
                const tracks = data.items || [];
                allTracks = allTracks.concat(tracks);
                nextUrl = data.next;

                // Pequeña pausa para no sobrecargar la API
                if (nextUrl) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            this.tracks = allTracks;
            this.displayTracks();

        } catch (error) {
            console.error('Error al cargar canciones:', error);
            this.showError('Error al cargar las canciones de la playlist');
        }
    }

    displayTracks() {
        const tracksList = document.getElementById('tracks-list');
        
        if (this.tracks.length === 0) {
            tracksList.innerHTML = `
                <div style="text-align: center; color: #b3b3b3; padding: 2rem;">
                    <i class="fas fa-music" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Esta playlist no tiene canciones</p>
                </div>
            `;
            return;
        }

        const tracksHtml = this.tracks.map((item, index) => {
            const track = item.track;
            if (!track) return '';

            const duration = Math.floor(track.duration_ms / 60000);
            const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);
            const durationText = `${duration}:${durationSeconds.toString().padStart(2, '0')}`;

            return `
                <div class="track-item" data-track-id="${track.id}">
                    <div class="track-number">${index + 1}</div>
                    <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/50x50?text=🎵'}" 
                         alt="${track.album.name}" class="track-image">
                    <div class="track-info">
                        <div class="track-name">${this.escapeHtml(track.name)}</div>
                        <div class="track-artist">${this.escapeHtml(track.artists.map(a => a.name).join(', '))} • ${this.escapeHtml(track.album.name)} • ${durationText}</div>
                    </div>
                    <div class="track-actions">
                        <button class="action-btn remove" onclick="editPlaylistManager.removeTrack('${track.id}')" title="Eliminar canción">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        tracksList.innerHTML = tracksHtml;
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

            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en búsqueda: ${response.status}`);
            }

            const data = await response.json();
            const tracks = data.tracks?.items || [];
            
            this.displaySearchSuggestions(tracks);

        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    }

    displaySearchSuggestions(tracks) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (tracks.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="suggestion-item" style="color: #b3b3b3; padding: 1rem; text-align: center;">
                    No se encontraron canciones
                </div>
            `;
            suggestionsContainer.style.display = 'block';
            return;
        }

        const suggestionsHtml = tracks.map(track => {
            const duration = Math.floor(track.duration_ms / 60000);
            const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);
            const durationText = `${duration}:${durationSeconds.toString().padStart(2, '0')}`;

            return `
                <div class="suggestion-item" onclick="editPlaylistManager.addTrack('${track.id}')">
                    <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/40x40?text=🎵'}" 
                         alt="${track.album.name}" style="width: 40px; height: 40px; border-radius: 4px;">
                    <div style="flex: 1;">
                        <div style="color: #ffffff; font-weight: 500;">${this.escapeHtml(track.name)}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">${this.escapeHtml(track.artists.map(a => a.name).join(', '))} • ${durationText}</div>
                    </div>
                    <button style="background: #1db954; color: white; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        }).join('');

        suggestionsContainer.innerHTML = suggestionsHtml;
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
            const existingTrack = this.tracks.find(item => item.track?.id === trackId);
            if (existingTrack) {
                this.showNotification('Esta canción ya está en la playlist', 'warning');
                return;
            }

            // Agregar canción a la playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`]
                })
            });

            if (!response.ok) {
                throw new Error(`Error al agregar canción: ${response.status}`);
            }

            // Limpiar búsqueda
            document.getElementById('track-search').value = '';
            this.hideSuggestions();

            // Recargar canciones
            await this.loadPlaylistTracks();
            
            // Actualizar contador
            const tracksCount = document.getElementById('tracks-count');
            tracksCount.textContent = parseInt(tracksCount.textContent) + 1;

            this.showNotification('Canción agregada exitosamente', 'success');

        } catch (error) {
            console.error('Error al agregar canción:', error);
            this.showError('Error al agregar la canción');
        }
    }

    async removeTrack(trackId) {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar esta canción de la playlist?');
        
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                throw new Error('No hay token de acceso');
            }

            // Eliminar canción de la playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tracks: [{ uri: `spotify:track:${trackId}` }]
                })
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar canción: ${response.status}`);
            }

            // Recargar canciones
            await this.loadPlaylistTracks();
            
            // Actualizar contador
            const tracksCount = document.getElementById('tracks-count');
            tracksCount.textContent = parseInt(tracksCount.textContent) - 1;

            this.showNotification('Canción eliminada exitosamente', 'success');

        } catch (error) {
            console.error('Error al eliminar canción:', error);
            this.showError('Error al eliminar la canción');
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
            const response = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}`, {
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

            // Actualizar información en la página
            document.getElementById('playlist-name').textContent = name;
            document.getElementById('playlist-description').textContent = description;
            document.getElementById('playlist-visibility').textContent = isPublic ? 'Pública' : 'Privada';

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
            color: white; font-weight: 500; z-index: 10000;
            background: ${type === 'success' ? '#1db954' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
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