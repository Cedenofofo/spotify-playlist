class PlaylistManager {
    constructor() {
        this.config = window.config;
        this.auth = new Auth();
        this.setupEventListeners();
    }

    setupEventListeners() {
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
        const playlistName = document.getElementById('playlist-name').value;
        const playlistDescription = document.getElementById('playlist-description').value;
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');

        if (!playlistName) {
            alert('Por favor, ingresa un nombre para la playlist');
            return;
        }

        if (selectedTracks.length === 0) {
            alert('Por favor, agrega al menos una canción a la playlist');
            return;
        }

        try {
            this.showLoading();

            // Crear la playlist
            const response = await fetch(`${this.config.apiUrl}/me/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: playlistDescription,
                    public: false
                })
            });

            const playlist = await response.json();

            if (playlist.id) {
                // Agregar las canciones a la playlist
                const trackUris = selectedTracks.map(track => track.uri);
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

                // Guardar la información de la playlist
                localStorage.setItem('currentPlaylist', JSON.stringify({
                    id: playlist.id,
                    name: playlistName,
                    tracks: selectedTracks
                }));

                this.showSuccess();
            } else {
                throw new Error('Error al crear la playlist');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear la playlist. Por favor, intenta de nuevo.');
        } finally {
            this.hideLoading();
        }
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

// Inicializar el gestor de playlists
new PlaylistManager(); 