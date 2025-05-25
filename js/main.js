class PlaylistManager {
    constructor() {
        this.config = window.config;
        this.auth = new Auth();
        this.selectedTracks = [];
        this.artistInputs = [];
        this.setupArtistInputs();
        this.setupEventListeners();
        this.renderSelectedTracks();
    }

    setupArtistInputs() {
        const artistInputsDiv = document.getElementById('artist-inputs');
        artistInputsDiv.innerHTML = '';
        this.artistInputs = [];
        this.addArtistInput();
    }

    addArtistInput(value = '') {
        const artistInputsDiv = document.getElementById('artist-inputs');
        const row = document.createElement('div');
        row.className = 'artist-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Nombre del artista';
        input.value = value;
        row.appendChild(input);
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
        document.getElementById('playlist-form').onsubmit = (e) => {
            e.preventDefault();
            this.createPlaylist();
        };

        const createPlaylistButton = document.getElementById('create-playlist');
        if (createPlaylistButton) {
            createPlaylistButton.addEventListener('click', () => this.createPlaylist());
        }

        const exportButton = document.getElementById('export-spotify');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportToSpotify());
        }

        const createNewButton = document.getElementById('create-new');
        if (createNewButton) {
            createNewButton.addEventListener('click', () => window.location.reload());
        }
    }

    async createPlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        const songsPerArtist = parseInt(document.getElementById('songs-per-artist').value);
        const artistNames = this.artistInputs.map(input => input.value.trim()).filter(Boolean);
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
                for (let i = 0; i < allTracks.length; i += 100) {
                    const uris = allTracks.slice(i, i + 100).map(t => t.uri);
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
                document.getElementById('success-message').innerHTML = `¡Playlist creada con éxito!<br><a href='https://open.spotify.com/playlist/${playlist.id}' target='_blank' class='spotify-button'><i class='fab fa-spotify'></i> Abrir en Spotify</a>`;
                this.selectedTracks = [];
                this.renderSelectedTracks();
            } else {
                throw new Error('Error al crear la playlist');
            }
        } catch (error) {
            alert('Error al crear la playlist: ' + error.message);
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
    }

    removeTrack(uri) {
        this.selectedTracks = this.selectedTracks.filter(track => track.uri !== uri);
        this.renderSelectedTracks();
    }

    renderSelectedTracks() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        selectedTracksDiv.innerHTML = '';
        this.selectedTracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.innerHTML = `
                <img src="${track.album.image || ''}" alt="${track.album.name}">
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

    async exportToSpotify() {
        const playlist = JSON.parse(localStorage.getItem('currentPlaylist'));
        
        if (!playlist) {
            alert('No se encontró la información de la playlist');
            return;
        }

        try {
            const exportButton = document.getElementById('export-spotify');
            exportButton.disabled = true;
            exportButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';

            // Agregar las canciones a la playlist
            const trackUris = playlist.tracks.map(track => track.uri);
            await fetch(`${this.config.apiUrl}/playlists/${playlist.id}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: trackUris
                })
            });

            // Mostrar mensaje de éxito y botón para abrir en Spotify
            document.getElementById('export-success').classList.remove('hidden');
            document.getElementById('open-spotify').href = `https://open.spotify.com/playlist/${playlist.id}`;
            exportButton.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al exportar la playlist. Por favor, intenta de nuevo.');
            exportButton.disabled = false;
            exportButton.innerHTML = '<i class="fab fa-spotify"></i> Exportar a Spotify';
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showSuccess() {
        document.getElementById('success-message').style.display = 'block';
    }
}

// Inicializar el gestor de playlists y exponer método para agregar canciones específicas
window.playlistManager = new PlaylistManager(); 