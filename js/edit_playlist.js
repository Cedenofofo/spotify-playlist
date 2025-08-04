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
        this.selectedTracks = new Set(); // Para selección múltiple
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

        // Botones de selección múltiple
        this.setupMultiSelectButtons();
        
        // Configurar búsqueda por artistas
        this.setupArtistSearch();
    }

    setupMultiSelectButtons() {
        // Agregar botones de selección múltiple en la sección correcta
        const tracksList = document.getElementById('tracks-list');
        if (tracksList) {
            // Crear contenedor para los botones de selección múltiple
            const multiSelectContainer = document.createElement('div');
            multiSelectContainer.className = 'multi-select-container';
            multiSelectContainer.innerHTML = `
                <div class="multi-select-actions">
                    <button type="button" id="select-all-btn" class="action-btn secondary">
                        <i class="fas fa-check-square"></i>
                        <span>Seleccionar todo</span>
                    </button>
                    <button type="button" id="deselect-all-btn" class="action-btn secondary" style="display: none;">
                        <i class="fas fa-square"></i>
                        <span>Deseleccionar todo</span>
                    </button>
                    <button type="button" id="delete-selected-btn" class="action-btn remove" style="display: none;">
                        <i class="fas fa-trash"></i>
                        <span>Eliminar seleccionadas</span>
                    </button>
                </div>
            `;
            
            // Insertar después del label "Canciones en la playlist" pero antes del contenedor de tracks
            const formGroup = tracksList.closest('.form-group');
            if (formGroup) {
                // Buscar el label dentro del form-group
                const label = formGroup.querySelector('.form-label');
                if (label) {
                    // Insertar después del label
                    label.parentNode.insertBefore(multiSelectContainer, label.nextSibling);
                } else {
                    // Fallback: insertar al inicio del form-group
                    formGroup.insertBefore(multiSelectContainer, formGroup.firstChild);
                }
            }

            // Event listeners para botones de selección múltiple
            document.getElementById('select-all-btn').addEventListener('click', () => {
                this.selectAllTracks();
            });

            document.getElementById('deselect-all-btn').addEventListener('click', () => {
                this.deselectAllTracks();
            });

            document.getElementById('delete-selected-btn').addEventListener('click', () => {
                this.deleteSelectedTracks();
            });
        }
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
        // Mostrar la información de la playlist en el hero section
        const currentPlaylistInfo = document.getElementById('current-playlist-info');
        currentPlaylistInfo.style.display = 'block';

        // Imagen de la playlist con manejo mejorado
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

        // Nombre de la playlist
        document.getElementById('playlist-name').textContent = this.playlist.name;

        // Descripción de la playlist
        const description = this.playlist.description || 'Sin descripción';
        document.getElementById('playlist-description').textContent = description;

        // Llenar formulario con datos actuales
        document.getElementById('edit-playlist-name').value = this.playlist.name;
        document.getElementById('edit-playlist-description').value = description || '';

        // Configurar visibilidad
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

            // Filtrar tracks que no están marcados para eliminar
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
        
        if (this.tracks.length === 0) {
            tracksList.innerHTML = '<p style="text-align: center; color: #b3b3b3;">No hay canciones en esta playlist</p>';
            return;
        }

        const tracksHTML = this.tracks.map((track, index) => {
            const trackImageUrl = this.getTrackImageUrl(track);
            const isSelected = this.selectedTracks.has(track.id);
            return `
                <div class="selected-track-item ${isSelected ? 'selected' : ''}" data-track-id="${track.id}">
                    <div class="track-checkbox">
                        <input type="checkbox" id="track-${track.id}" ${isSelected ? 'checked' : ''} 
                               onchange="editPlaylistManager.toggleTrackSelection('${track.id}')">
                        <label for="track-${track.id}"></label>
                    </div>
                    <div class="track-number">${index + 1}</div>
                    <img src="${trackImageUrl}" 
                         alt="Album cover" 
                         class="track-image"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/40x40/1db954/ffffff?text=🎵'; this.classList.add('placeholder-image');"
                         onload="this.classList.remove('placeholder-image');">
                    <div class="track-info">
                        <div class="track-name">${this.escapeHtml(track.name)}</div>
                        <div class="track-artist">${this.escapeHtml(track.artists.map(artist => artist.name).join(', '))}</div>
                    </div>
                    <div class="track-actions">
                        <button class="action-btn remove" onclick="editPlaylistManager.removeTrack('${track.id}')" title="Eliminar canción">
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
            return 'https://via.placeholder.com/40x40/1db954/ffffff?text=🎵';
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
        return 'https://via.placeholder.com/40x40/1db954/ffffff?text=🎵';
    }

    async searchTracks(query) {
        if (!query.trim()) {
            this.hideSuggestions();
            return;
        }

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
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
        
        if (tracks.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item"><p style="color: #b3b3b3; text-align: center;">No se encontraron canciones</p></div>';
            suggestionsContainer.style.display = 'block';
            return;
        }

        const suggestionsHTML = tracks.map(track => {
            const trackImageUrl = this.getTrackImageUrl(track);
            const isAlreadyInPlaylist = this.tracks.some(t => t.id === track.id);
            return `
                <div class="suggestion-item ${isAlreadyInPlaylist ? 'already-added' : ''}" onclick="editPlaylistManager.addTrack('${track.id}')">
                    <img src="${trackImageUrl}" 
                         alt="Album cover"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/30x30/1db954/ffffff?text=🎵'; this.classList.add('placeholder-image');"
                         onload="this.classList.remove('placeholder-image');">
                    <div class="suggestion-info">
                        <div class="suggestion-title">${this.escapeHtml(track.name)}</div>
                        <div class="suggestion-subtitle">${this.escapeHtml(track.artists.map(artist => artist.name).join(', '))}</div>
                        ${isAlreadyInPlaylist ? '<div class="already-in-playlist">Ya en la playlist</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        suggestionsContainer.innerHTML = suggestionsHTML;
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
                this.auth.logout();
                return;
            }

            // Verificar si ya existe en la lista
            if (this.tracks.some(t => t.id === trackId)) {
                this.showNotification('Esta canción ya está en la playlist', 'warning');
                return;
            }

            // Obtener información completa del track
            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener track: ${response.status}`);
            }

            const track = await response.json();

            // Agregar a la lista local
            this.tracks.push(track);
            this.pendingChanges.tracksToAdd.push(trackId);

            // Actualizar display
            this.displayTracks();
            this.updateTrackCount();
            this.hideSuggestions();

            // Limpiar campo de búsqueda
            document.getElementById('track-search').value = '';

            this.showNotification('Canción agregada a la playlist', 'success');

        } catch (error) {
            console.error('Error al agregar track:', error);
            this.showError('Error al agregar la canción');
        }
    }

    removeTrack(trackId) {
        // Remover de la lista local
        this.tracks = this.tracks.filter(track => track.id !== trackId);
        
        // Agregar a la lista de tracks a eliminar
        if (!this.pendingChanges.tracksToRemove.includes(trackId)) {
            this.pendingChanges.tracksToRemove.push(trackId);
        }

        // Remover de la lista de tracks a agregar si estaba ahí
        this.pendingChanges.tracksToAdd = this.pendingChanges.tracksToAdd.filter(id => id !== trackId);

        // Remover de la selección múltiple
        this.selectedTracks.delete(trackId);

        // Actualizar display
        this.displayTracks();
        this.updateTrackCount();

        this.showNotification('Canción removida de la playlist', 'info');
    }

    // Funciones de selección múltiple
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

        // Eliminar todas las canciones seleccionadas
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
        
        // También actualizar en el hero section
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

            // Mostrar loading
            const loadingContainer = document.getElementById('loading');
            loadingContainer.style.display = 'block';

            // 1. Actualizar información básica de la playlist
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

            // 2. Eliminar tracks marcados para eliminar
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

            // 3. Agregar tracks marcados para agregar
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

            // Limpiar cambios pendientes
            this.pendingChanges = {
                tracksToRemove: [],
                tracksToAdd: [],
                infoChanges: null
            };

            // Ocultar loading
            loadingContainer.style.display = 'none';

            // Mostrar mensaje de éxito
            this.showNotification('Playlist actualizada exitosamente', 'success');

            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = 'modify_playlists.html';
            }, 2000);

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.showError('Error al guardar los cambios');
            
            // Ocultar loading
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

    // ===== FUNCIONES DE BÚSQUEDA POR ARTISTAS =====

    setupArtistSearch() {
        // Configurar botón de agregar artista
        const addArtistBtn = document.getElementById('add-artist');
        if (addArtistBtn) {
            addArtistBtn.addEventListener('click', () => {
                this.addArtistInput();
            });
        }

        // Configurar botón de buscar por artistas
        const searchByArtistsBtn = document.getElementById('search-by-artists');
        if (searchByArtistsBtn) {
            searchByArtistsBtn.addEventListener('click', () => {
                this.searchByArtists();
            });
        }
    }

    addArtistInput() {
        const artistInputs = document.getElementById('artist-inputs');
        const newRow = document.createElement('div');
        newRow.className = 'artist-row';
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateX(-20px)';
        newRow.style.transition = 'all 0.3s ease';
        
        // Crear ID único para este artista
        const artistId = 'artist-' + Date.now();
        
        newRow.innerHTML = `
            <div class="autocomplete-container">
                <input type="text" class="form-input artist-autocomplete" 
                       id="${artistId}" 
                       placeholder="Nombre del artista" 
                       autocomplete="off">
                <div class="autocomplete-suggestions" id="${artistId}-suggestions"></div>
            </div>
            <button type="button" class="remove-artist-btn" onclick="editPlaylistManager.removeArtist(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        artistInputs.appendChild(newRow);
        
        // Configurar autocompletado para el nuevo artista
        this.setupAutocompleteForArtist(artistId);
        
        // Animación de entrada
        setTimeout(() => {
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateX(0)';
        }, 50);
    }

    removeArtist(button) {
        const row = button.closest('.artist-row');
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            row.remove();
        }, 300);
    }

    setupAutocompleteForArtist(artistId) {
        const artistInput = document.getElementById(artistId);
        const suggestionsDiv = document.getElementById(artistId + '-suggestions');
        
        if (!artistInput || !suggestionsDiv) {
            console.error(`No se encontraron elementos para autocompletado de artista: ${artistId}`);
            return;
        }
        
        let debounceTimeout;
        
        artistInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length < 2) {
                suggestionsDiv.innerHTML = '';
                return;
            }
            
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                editPlaylistManager.searchArtists(query, suggestionsDiv, artistInput);
            }, 300);
        });
        
        artistInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsDiv.innerHTML = '';
            }, 200);
        });
    }

    async searchArtists(query, suggestionsDiv, artistInput) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                console.error('No hay token de acceso');
                return;
            }
            
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.artists && data.artists.items) {
                this.displayArtistResults(data.artists.items, suggestionsDiv, artistInput);
            }
        } catch (error) {
            console.error('Error al buscar artistas:', error);
            suggestionsDiv.innerHTML = '<div class="error">Error al buscar artistas</div>';
        }
    }

    displayArtistResults(artists, suggestionsDiv, artistInput) {
        suggestionsDiv.innerHTML = '';
        
        artists.forEach(artist => {
            const artistDiv = document.createElement('div');
            artistDiv.className = 'autocomplete-suggestion';
            artistDiv.innerHTML = `
                <img src="${artist.images[0]?.url || 'https://via.placeholder.com/32?text=🎤'}" alt="${artist.name}">
                <span>${artist.name}</span>
            `;
            
            artistDiv.addEventListener('click', () => {
                artistInput.value = artist.name;
                suggestionsDiv.innerHTML = '';
            });
            
            suggestionsDiv.appendChild(artistDiv);
        });
    }

    async searchByArtists() {
        const artistInputs = document.querySelectorAll('#artist-inputs input');
        const songsPerArtist = document.getElementById('songs-per-artist').value;
        
        if (artistInputs.length === 0) {
            this.showNotification('Por favor, agrega al menos un artista', 'error');
            return;
        }

        const artists = Array.from(artistInputs).map(input => input.value.trim()).filter(name => name.length > 0);
        
        if (artists.length === 0) {
            this.showNotification('Por favor, ingresa nombres de artistas', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            this.showNotification('Buscando canciones por artistas...', 'info');

            const allTracks = [];
            
            for (const artistName of artists) {
                // Buscar el artista
                const artistResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!artistResponse.ok) continue;

                const artistData = await artistResponse.json();
                if (!artistData.artists || artistData.artists.items.length === 0) continue;

                const artistId = artistData.artists.items[0].id;

                // Buscar canciones del artista
                const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!tracksResponse.ok) continue;

                const tracksData = await tracksResponse.json();
                const artistTracks = tracksData.tracks.slice(0, parseInt(songsPerArtist));
                
                allTracks.push(...artistTracks);
            }

            // Agregar las canciones encontradas a la playlist
            for (const track of allTracks) {
                if (!this.tracks.some(t => t.id === track.id)) {
                    this.tracks.push(track);
                    this.pendingChanges.tracksToAdd.push(track.id);
                }
            }

            // Actualizar display
            this.displayTracks();
            this.updateTrackCount();
            
            this.showNotification(`Se agregaron ${allTracks.length} canciones de ${artists.length} artista(s)`, 'success');

        } catch (error) {
            console.error('Error al buscar por artistas:', error);
            this.showError('Error al buscar canciones por artistas');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.editPlaylistManager = new EditPlaylistManager();
}); 