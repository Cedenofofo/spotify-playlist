class EditPlaylistManager {
    constructor() {
        this.auth = new Auth();
        this.playlistId = null;
        this.playlist = null;
        this.tracks = [];
        this.pendingChanges = {
            tracksToRemove: [],
            tracksToAdd: [],
            infoChanges: null
        };
        this.selectedTracks = new Set();
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

        // Búsqueda simple de canciones
        document.getElementById('search-track-btn').addEventListener('click', () => {
            this.searchTracks();
        });

        // Búsqueda por artistas
        document.getElementById('search-artist-btn').addEventListener('click', () => {
            this.searchByArtist();
        });

        // Botones de selección múltiple
        this.setupMultiSelectButtons();
    }

    setupMultiSelectButtons() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const deselectAllBtn = document.getElementById('deselect-all-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllTracks());
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAllTracks());
        }
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedTracks());
        }
    }

    async loadPlaylistData() {
        try {
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
        const currentPlaylistInfo = document.getElementById('current-playlist-info');
        currentPlaylistInfo.style.display = 'block';

        const playlistImage = document.getElementById('playlist-image');
        const imageUrl = this.getPlaylistImageUrl(this.playlist);
        
        playlistImage.src = imageUrl;
        playlistImage.onerror = function() {
            this.onerror = null;
            this.src = 'https://via.placeholder.com/120x120/1db954/ffffff?text=🎵';
            this.classList.add('placeholder-image');
        };
        playlistImage.onload = function() {
            this.classList.remove('placeholder-image');
        };

        document.getElementById('playlist-name').textContent = this.playlist.name;

        const description = this.playlist.description || 'Sin descripción';
        document.getElementById('playlist-description').textContent = description;

        document.getElementById('edit-playlist-name').value = this.playlist.name;
        document.getElementById('edit-playlist-description').value = description || '';

        const publicRadio = document.getElementById('public-playlist');
        const privateRadio = document.getElementById('private-playlist');
        
        if (this.playlist.public) {
            publicRadio.checked = true;
        } else {
            privateRadio.checked = true;
        }
    }

    getPlaylistImageUrl(playlist) {
        if (!playlist.images || playlist.images.length === 0) {
            return 'https://via.placeholder.com/120x120/1db954/ffffff?text=🎵';
        }
        const firstImage = playlist.images[0];
        if (firstImage && firstImage.url) {
            return firstImage.url;
        }
        for (let i = 1; i < playlist.images.length; i++) {
            if (playlist.images[i] && playlist.images[i].url) {
                return playlist.images[i].url;
            }
        }
        return 'https://via.placeholder.com/120x120/1db954/ffffff?text=🎵';
    }

    async loadPlaylistTracks() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            let allTracks = [];
            let nextUrl = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks?limit=100`;

            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar tracks: ${response.status}`);
                }

                const data = await response.json();
                allTracks = allTracks.concat(data.items);
                nextUrl = data.next;
            }

            this.tracks = allTracks.filter(item => 
                !this.pendingChanges.tracksToRemove.includes(item.track.id)
            ).map(item => item.track);

            this.displayTracks();
            this.updateTrackCount();

        } catch (error) {
            console.error('Error al cargar tracks:', error);
            this.showError('Error al cargar las canciones');
        }
    }

    displayTracks() {
        const tracksList = document.getElementById('tracks-list');
        const multiSelectContainer = document.getElementById('multi-select-container');
        
        if (this.tracks.length === 0) {
            tracksList.innerHTML = '<p style="text-align: center; color: #b3b3b3;">No hay canciones en esta playlist</p>';
            multiSelectContainer.style.display = 'none';
            return;
        }

        multiSelectContainer.style.display = 'block';

        const tracksHTML = this.tracks.map((track, index) => {
            const trackImageUrl = this.getTrackImageUrl(track);
            const isSelected = this.selectedTracks.has(track.id);
            return `
                <div class="track-item ${isSelected ? 'selected' : ''}" data-track-id="${track.id}">
                    <div class="track-checkbox">
                        <input type="checkbox" id="track-${track.id}" ${isSelected ? 'checked' : ''} 
                               onchange="editPlaylistManager.toggleTrackSelection('${track.id}')">
                    </div>
                    <div class="track-number">${index + 1}</div>
                    <img src="${trackImageUrl}" 
                         alt="Album cover" 
                         class="track-image"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/50x50/1db954/ffffff?text=🎵'; this.classList.add('placeholder-image');"
                         onload="this.classList.remove('placeholder-image');">
                    <div class="track-info">
                        <div class="track-name">${this.escapeHtml(track.name)}</div>
                        <div class="track-artist">${this.escapeHtml(track.artists.map(artist => artist.name).join(', '))}</div>
                    </div>
                    <div class="track-actions">
                        <button class="remove-track-btn" onclick="editPlaylistManager.removeTrack('${track.id}')" title="Eliminar canción">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        tracksList.innerHTML = tracksHTML;
        this.updateMultiSelectButtons();
    }

    getTrackImageUrl(track) {
        if (!track.album || !track.album.images || track.album.images.length === 0) {
            return 'https://via.placeholder.com/50x50/1db954/ffffff?text=🎵';
        }
        const firstImage = track.album.images[0];
        if (firstImage && firstImage.url) {
            return firstImage.url;
        }
        for (let i = 1; i < track.album.images.length; i++) {
            if (track.album.images[i] && track.album.images[i].url) {
                return track.album.images[i].url;
            }
        }
        return 'https://via.placeholder.com/50x50/1db954/ffffff?text=🎵';
    }

    async searchTracks() {
        const query = document.getElementById('simple-track-search').value.trim();
        if (!query) {
            this.showNotification('Por favor, ingresa un término de búsqueda', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            this.showNotification('Buscando canciones...', 'info');

            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en búsqueda: ${response.status}`);
            }

            const data = await response.json();
            this.displaySearchResults(data.tracks.items, 'search-results');

        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showError('Error al buscar canciones');
        }
    }

    async searchByArtist() {
        const artistName = document.getElementById('artist-search-input').value.trim();
        const tracksPerArtist = document.getElementById('tracks-per-artist').value;

        if (!artistName) {
            this.showNotification('Por favor, ingresa el nombre del artista', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            this.showNotification('Buscando canciones del artista...', 'info');

            // Buscar el artista
            const artistResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!artistResponse.ok) {
                throw new Error(`Error al buscar artista: ${artistResponse.status}`);
            }

            const artistData = await artistResponse.json();
            if (!artistData.artists || artistData.artists.items.length === 0) {
                this.showNotification('No se encontró el artista', 'warning');
                return;
            }

            const artistId = artistData.artists.items[0].id;

            // Buscar canciones del artista
            const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!tracksResponse.ok) {
                throw new Error(`Error al buscar canciones: ${tracksResponse.status}`);
            }

            const tracksData = await tracksResponse.json();
            const artistTracks = tracksData.tracks.slice(0, parseInt(tracksPerArtist));

            this.displaySearchResults(artistTracks, 'artist-results');

        } catch (error) {
            console.error('Error al buscar por artista:', error);
            this.showError('Error al buscar canciones del artista');
        }
    }

    displaySearchResults(tracks, containerId) {
        const container = document.getElementById(containerId);
        
        if (tracks.length === 0) {
            container.innerHTML = '<p style="color: #b3b3b3; text-align: center; padding: 1rem;">No se encontraron canciones</p>';
            container.style.display = 'block';
            return;
        }

        const resultsHTML = tracks.map(track => {
            const trackImageUrl = this.getTrackImageUrl(track);
            const isAlreadyInPlaylist = this.tracks.some(t => t.id === track.id);
            return `
                <div class="search-result-item">
                    <img src="${trackImageUrl}" 
                         alt="Album cover"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/50x50/1db954/ffffff?text=🎵'; this.classList.add('placeholder-image');"
                         onload="this.classList.remove('placeholder-image');">
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(track.name)}</div>
                        <div class="search-result-subtitle">${this.escapeHtml(track.artists.map(artist => artist.name).join(', '))}</div>
                    </div>
                    <div class="search-result-actions">
                        ${isAlreadyInPlaylist ? 
                            '<span style="color: #b3b3b3; font-size: 0.8rem;">Ya en playlist</span>' :
                            `<button class="add-track-btn" onclick="editPlaylistManager.addTrack('${track.id}')">
                                <i class="fas fa-plus"></i>
                                Agregar
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = resultsHTML;
        container.style.display = 'block';
    }

    async addTrack(trackId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            if (this.tracks.some(t => t.id === trackId)) {
                this.showNotification('Esta canción ya está en la playlist', 'warning');
                return;
            }

            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener track: ${response.status}`);
            }

            const track = await response.json();

            this.tracks.push(track);
            this.pendingChanges.tracksToAdd.push(trackId);

            this.displayTracks();
            this.updateTrackCount();

            this.showNotification('Canción agregada a la playlist', 'success');

        } catch (error) {
            console.error('Error al agregar track:', error);
            this.showError('Error al agregar la canción');
        }
    }

    removeTrack(trackId) {
        this.tracks = this.tracks.filter(track => track.id !== trackId);
        
        if (!this.pendingChanges.tracksToRemove.includes(trackId)) {
            this.pendingChanges.tracksToRemove.push(trackId);
        }

        this.pendingChanges.tracksToAdd = this.pendingChanges.tracksToAdd.filter(id => id !== trackId);
        this.selectedTracks.delete(trackId);

        this.displayTracks();
        this.updateTrackCount();

        this.showNotification('Canción removida de la playlist', 'info');
    }

    toggleTrackSelection(trackId) {
        if (this.selectedTracks.has(trackId)) {
            this.selectedTracks.delete(trackId);
        } else {
            this.selectedTracks.add(trackId);
        }
        this.updateMultiSelectButtons();
    }

    selectAllTracks() {
        this.tracks.forEach(track => {
            this.selectedTracks.add(track.id);
        });
        this.displayTracks();
        this.updateMultiSelectButtons();
    }

    deselectAllTracks() {
        this.selectedTracks.clear();
        this.displayTracks();
        this.updateMultiSelectButtons();
    }

    deleteSelectedTracks() {
        if (this.selectedTracks.size === 0) {
            this.showNotification('No hay canciones seleccionadas', 'warning');
            return;
        }

        const confirmed = confirm(`¿Estás seguro de que quieres eliminar ${this.selectedTracks.size} canción(es) de la playlist?`);
        if (!confirmed) return;

        this.selectedTracks.forEach(trackId => {
            this.removeTrack(trackId);
        });

        this.selectedTracks.clear();
        this.updateMultiSelectButtons();
        this.showNotification(`${this.selectedTracks.size} canción(es) eliminada(s)`, 'success');
    }

    updateMultiSelectButtons() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const deselectAllBtn = document.getElementById('deselect-all-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');

        if (this.selectedTracks.size === 0) {
            selectAllBtn.style.display = 'inline-flex';
            deselectAllBtn.style.display = 'none';
            deleteSelectedBtn.style.display = 'none';
        } else if (this.selectedTracks.size === this.tracks.length) {
            selectAllBtn.style.display = 'none';
            deselectAllBtn.style.display = 'inline-flex';
            deleteSelectedBtn.style.display = 'inline-flex';
        } else {
            selectAllBtn.style.display = 'inline-flex';
            deselectAllBtn.style.display = 'inline-flex';
            deleteSelectedBtn.style.display = 'inline-flex';
        }
    }

    updateTrackCount() {
        const tracksCountElement = document.getElementById('tracks-count');
        if (tracksCountElement) {
            tracksCountElement.textContent = `${this.tracks.length} canciones`;
        }
        
        const heroTracksCount = document.querySelector('#current-playlist-info .playlist-preview-stats span:first-child');
        if (heroTracksCount) {
            heroTracksCount.textContent = `${this.tracks.length} canciones`;
        }
    }

    async savePlaylistChanges() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            const loadingContainer = document.getElementById('loading');
            loadingContainer.style.display = 'block';

            const playlistName = document.getElementById('edit-playlist-name').value;
            const playlistDescription = document.getElementById('edit-playlist-description').value;
            const isPublic = document.getElementById('public-playlist').checked;

            const updateResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: playlistDescription,
                    public: isPublic
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`Error al actualizar playlist: ${updateResponse.status}`);
            }

            for (const trackId of this.pendingChanges.tracksToRemove) {
                const removeResponse = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tracks: [{ uri: `spotify:track:${trackId}` }]
                    })
                });

                if (!removeResponse.ok) {
                    console.warn(`Error al eliminar track ${trackId}: ${removeResponse.status}`);
                }
            }

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
                    throw new Error(`Error al agregar tracks: ${addResponse.status}`);
                }
            }

            this.pendingChanges = {
                tracksToRemove: [],
                tracksToAdd: [],
                infoChanges: null
            };

            loadingContainer.style.display = 'none';
            this.showNotification('Playlist actualizada exitosamente', 'success');

            setTimeout(() => {
                window.location.href = 'modify_playlists.html';
            }, 2000);

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.showError('Error al guardar los cambios');
            document.getElementById('loading').style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const messageContainer = document.getElementById('success-message');
        messageContainer.innerHTML = `
            <div class="message ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        messageContainer.style.display = 'block';

        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
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