class PlaylistManager {
    constructor() {
        this.config = window.config;
        this.auth = new Auth();
        this.selectedTracks = [];
        this.artistInputs = [];
        this.previewTracks = [];
        this.previewPlaylistId = null;
        this.setupArtistInputs();
        this.setupEventListeners();
        this.renderSelectedTracks();
        this.setupArtistAutocomplete(document.getElementById('artist-main'), document.getElementById('artist-main-suggestions'));
    }

    setupArtistInputs() {
        const artistInputsDiv = document.getElementById('artist-inputs');
        artistInputsDiv.innerHTML = '';
        this.artistInputs = [];
    }

    addArtistInput(value = '') {
        const artistInputsDiv = document.getElementById('artist-inputs');
        const row = document.createElement('div');
        row.className = 'artist-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Nombre del artista adicional';
        input.setAttribute('aria-label', 'Nombre del artista adicional');
        input.value = value;
        row.appendChild(input);
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'autocomplete-suggestions';
        row.appendChild(suggestionsDiv);
        this.setupArtistAutocomplete(input, suggestionsDiv);
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => {
            row.remove();
            this.artistInputs = this.artistInputs.filter(i => i !== input);
        };
        row.appendChild(removeBtn);
        artistInputsDiv.appendChild(row);
        this.artistInputs.push(input);
    }

    setupEventListeners() {
        document.getElementById('add-artist').onclick = () => this.addArtistInput();
        document.getElementById('preview-playlist').onclick = () => this.previewPlaylist();
        document.getElementById('export-spotify').onclick = () => this.exportToSpotify();
        // Validar solo números en el input de cantidad de canciones
        const songsInput = document.getElementById('songs-per-artist');
        songsInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value === '' || parseInt(this.value) < 1) this.value = 1;
            if (parseInt(this.value) > 50) this.value = 50;
        });
    }

    setupArtistAutocomplete(input, suggestionsDiv) {
        let lastQuery = '';
        let debounceTimeout;
        input.addEventListener('input', async (e) => {
            const query = input.value.trim();
            if (query.length < 1) {
                suggestionsDiv.innerHTML = '';
                return;
            }
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                if (query === lastQuery) return;
                lastQuery = query;
                const artists = await this.searchArtists(query);
                suggestionsDiv.innerHTML = '';
                if (artists.length === 0) {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.textContent = 'No se encontraron artistas';
                    suggestionsDiv.appendChild(div);
                }
                artists.forEach(artist => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.innerHTML = `<img src='${artist.images[0]?.url || 'https://via.placeholder.com/32?text=🎤'}' alt='${artist.name}'>${artist.name}`;
                    div.onclick = () => {
                        input.value = artist.name;
                        suggestionsDiv.innerHTML = '';
                    };
                    suggestionsDiv.appendChild(div);
                });
            }, 300);
        });
        input.addEventListener('blur', () => setTimeout(() => suggestionsDiv.innerHTML = '', 200));
    }

    async searchArtists(query) {
        try {
            const token = this.auth.getAccessToken();
            if (!token) {
                alert('Tu sesión de Spotify ha expirado o no es válida. Por favor, inicia sesión de nuevo.');
                window.location.reload();
                return [];
            }
            const response = await fetch(`${this.config.apiUrl}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                alert('Tu sesión de Spotify ha expirado o no es válida. Por favor, inicia sesión de nuevo.');
                window.location.reload();
                return [];
            }
            if (!response.ok) {
                alert('Error de red o de autenticación con Spotify. Intenta recargar la página.');
                return [];
            }
            const data = await response.json();
            if (data.artists && data.artists.items) {
                return data.artists.items;
            }
        } catch (e) {
            alert('Error de red o de autenticación con Spotify. Intenta recargar la página.');
        }
        return [];
    }

    async previewPlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        const songsPerArtist = parseInt(document.getElementById('songs-per-artist').value);
        const mainArtist = document.getElementById('artist-main').value.trim();
        const artistNames = [mainArtist, ...this.artistInputs.map(input => input.value.trim())].filter(Boolean);
        let allTracks = [...this.selectedTracks];

        if (!playlistName) {
            alert('Por favor, ingresa un nombre para la playlist');
            return;
        }

        if (artistNames.length > 0) {
            document.getElementById('loading').style.display = 'block';
            for (const artist of artistNames) {
                const tracks = await this.searchTracksByArtist(artist, songsPerArtist);
                for (const t of tracks) {
                    if (!allTracks.some(track => track.uri === t.uri)) {
                        allTracks.push(t);
                    }
                }
            }
            document.getElementById('loading').style.display = 'none';
        }

        if (allTracks.length === 0) {
            alert('Agrega al menos un artista o una canción específica');
            return;
        }

        this.previewTracks = allTracks;
        this.previewPlaylistId = null;
        this.renderPlaylistPreview(playlistName, allTracks);
        document.getElementById('playlist-preview').style.display = 'block';
        document.getElementById('export-spotify').style.display = 'inline-block';
    }

    renderPlaylistPreview(playlistName, tracks) {
        const previewDiv = document.getElementById('playlist-preview');
        previewDiv.innerHTML = `<h3>${playlistName}</h3><ul>${tracks.map((track, idx) => `
            <li><img src='${track.album.image || 'https://via.placeholder.com/40?text=🎵'}' alt='${track.album.name}'>
            <span class='track-name'>${track.name}</span>
            <span class='track-artist'>${track.artist}</span>
            <button class='remove-track-preview' data-idx='${idx}' title='Eliminar canción'><i class='fas fa-times'></i></button></li>`).join('')}</ul>`;
        // Botones para eliminar canciones en la vista previa
        previewDiv.querySelectorAll('.remove-track-preview').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                this.previewTracks.splice(idx, 1);
                this.renderPlaylistPreview(playlistName, this.previewTracks);
            };
        });
    }

    async exportToSpotify() {
        if (!this.previewTracks || this.previewTracks.length === 0) {
            alert('Primero genera la vista previa de la playlist.');
            return;
        }
        const playlistName = document.getElementById('playlist-name').value.trim();
        try {
            document.getElementById('loading').style.display = 'block';
            // Crear la playlist
            const response = await fetch(`${this.config.apiUrl}/me/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    public: false
                })
            });
            const playlist = await response.json();
            if (playlist.id) {
                // Agregar canciones a la playlist (en lotes de 100)
                for (let i = 0; i < this.previewTracks.length; i += 100) {
                    const uris = this.previewTracks.slice(i, i + 100).map(t => t.uri);
                    await fetch(`${this.config.apiUrl}/playlists/${playlist.id}/tracks`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ uris })
                    });
                }
                document.getElementById('success-message').style.display = 'block';
                document.getElementById('success-message').innerHTML = `¡Playlist creada y exportada con éxito!<br><a href='https://open.spotify.com/playlist/${playlist.id}' target='_blank' class='spotify-button'><i class='fab fa-spotify'></i> Abrir en Spotify</a>`;
                document.getElementById('playlist-preview').style.display = 'none';
                document.getElementById('export-spotify').style.display = 'none';
                this.selectedTracks = [];
                this.renderSelectedTracks();
            } else {
                throw new Error('Error al crear la playlist');
            }
        } catch (error) {
            alert('Error al exportar la playlist: ' + error.message);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    async searchTracksByArtist(artist, limit) {
        try {
            const response = await fetch(`${this.config.apiUrl}/search?q=${encodeURIComponent(artist)}&type=track&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`
                }
            });
            const data = await response.json();
            if (data.tracks && data.tracks.items) {
                return data.tracks.items.map(track => ({
                    uri: track.uri,
                    name: track.name,
                    artist: track.artists.map(a => a.name).join(', '),
                    album: {
                        name: track.album.name,
                        image: track.album.images[0]?.url
                    }
                }));
            }
        } catch (e) { }
        return [];
    }

    addSpecificTrack(track) {
        if (this.selectedTracks.some(t => t.uri === track.uri)) {
            alert('Esta canción ya está en la lista');
            return;
        }
        this.selectedTracks.push({
            uri: track.uri,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: {
                name: track.album.name,
                image: track.album.images[0]?.url
            }
        });
        this.renderSelectedTracks();
        // Actualizar la vista previa si está visible
        if (document.getElementById('playlist-preview').style.display !== 'none') {
            this.previewTracks.push(this.selectedTracks[this.selectedTracks.length - 1]);
            this.renderPlaylistPreview(document.getElementById('playlist-name').value.trim(), this.previewTracks);
        }
    }

    removeTrack(uri) {
        this.selectedTracks = this.selectedTracks.filter(track => track.uri !== uri);
        this.renderSelectedTracks();
        // Actualizar la vista previa si está visible
        if (document.getElementById('playlist-preview').style.display !== 'none') {
            this.previewTracks = this.previewTracks.filter(track => track.uri !== uri);
            this.renderPlaylistPreview(document.getElementById('playlist-name').value.trim(), this.previewTracks);
        }
    }

    renderSelectedTracks() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        selectedTracksDiv.innerHTML = '';
        this.selectedTracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.innerHTML = `
                <img src="${track.album.image || 'https://via.placeholder.com/40?text=🎵'}" alt="${track.album.name}">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <button class="remove-track" data-uri="${track.uri}"><i class="fas fa-times"></i></button>
            `;
            trackDiv.querySelector('.remove-track').onclick = () => this.removeTrack(track.uri);
            selectedTracksDiv.appendChild(trackDiv);
        });
    }
}

// Inicializar el gestor de playlists y exponer método para agregar canciones específicas
window.playlistManager = new PlaylistManager(); 