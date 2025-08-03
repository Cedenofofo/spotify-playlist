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
        this.initializeAnimations();
    }

    initializeAnimations() {
        // Agregar animaciones de entrada
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });

        // Efectos hover en botones
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.classList.add('glow');
            });
            button.addEventListener('mouseleave', () => {
                button.classList.remove('glow');
            });
        });
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
        row.style.animation = 'slideInLeft 0.5s ease-out';
        
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
            row.style.animation = 'slideInLeft 0.3s ease-out reverse';
            setTimeout(() => {
                row.remove();
                this.artistInputs = this.artistInputs.filter(i => i !== input);
            }, 300);
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

        // Efectos de focus en inputs
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('glow');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('glow');
            });
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
                
                // Mostrar loading en el input
                input.style.background = 'rgba(255, 255, 255, 0.15)';
                
                const artists = await this.searchArtists(query);
                suggestionsDiv.innerHTML = '';
                
                if (artists.length === 0) {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.innerHTML = '<i class="fas fa-search" style="margin-right: 8px; opacity: 0.5;"></i>No se encontraron artistas';
                    suggestionsDiv.appendChild(div);
                }
                
                artists.forEach(artist => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.innerHTML = `
                        <img src='${artist.images[0]?.url || 'https://via.placeholder.com/40?text=🎤'}' alt='${artist.name}'>
                        <span>${artist.name}</span>
                    `;
                    div.onclick = () => {
                        input.value = artist.name;
                        suggestionsDiv.innerHTML = '';
                        input.style.background = '';
                    };
                    suggestionsDiv.appendChild(div);
                });
                
                input.style.background = '';
            }, 300);
        });
        
        input.addEventListener('blur', () => setTimeout(() => {
            suggestionsDiv.innerHTML = '';
            input.style.background = '';
        }, 200));
    }

    async searchArtists(query) {
        try {
            const token = this.auth.getAccessToken();
            if (!token) {
                this.showMessage('Tu sesión de Spotify ha expirado. Por favor, inicia sesión de nuevo.', 'error');
                setTimeout(() => window.location.reload(), 2000);
                return [];
            }
            
            const response = await fetch(`${this.config.apiUrl}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                this.showMessage('Tu sesión de Spotify ha expirado. Por favor, inicia sesión de nuevo.', 'error');
                setTimeout(() => window.location.reload(), 2000);
                return [];
            }
            
            if (response.status === 403) {
                this.showMessage('No tienes permisos para usar la API de Spotify. Asegúrate de aceptar todos los permisos.', 'error');
                return [];
            }
            
            if (!response.ok) {
                this.showMessage('Error de red o de autenticación con Spotify. Intenta recargar la página.', 'error');
                return [];
            }
            
            const data = await response.json();
            if (data.artists && data.artists.items) {
                return data.artists.items;
            }
        } catch (e) {
            this.showMessage('Error de red o de autenticación con Spotify. Intenta recargar la página.', 'error');
        }
        return [];
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.getElementById('success-message');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = message;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    async previewPlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        const songsPerArtist = parseInt(document.getElementById('songs-per-artist').value);
        const mainArtist = document.getElementById('artist-main').value.trim();
        const artistNames = [mainArtist, ...this.artistInputs.map(input => input.value.trim())].filter(Boolean);
        let allTracks = [...this.selectedTracks];

        if (!playlistName) {
            this.showMessage('Por favor, ingresa un nombre para la playlist', 'warning');
            return;
        }

        if (artistNames.length > 0) {
            const loadingDiv = document.getElementById('loading');
            loadingDiv.style.display = 'block';
            
            try {
                for (const artist of artistNames) {
                    const tracks = await this.searchTracksByArtist(artist, songsPerArtist);
                    for (const t of tracks) {
                        if (!allTracks.some(track => track.uri === t.uri)) {
                            allTracks.push(t);
                        }
                    }
                }
            } catch (error) {
                this.showMessage('Error al buscar canciones de los artistas', 'error');
            } finally {
                loadingDiv.style.display = 'none';
            }
        }

        if (allTracks.length === 0) {
            this.showMessage('Agrega al menos un artista o una canción específica', 'warning');
            return;
        }

        this.previewTracks = allTracks;
        this.previewPlaylistId = null;
        this.renderPlaylistPreview(playlistName, allTracks);
        
        const previewDiv = document.getElementById('playlist-preview');
        previewDiv.style.display = 'block';
        previewDiv.style.animation = 'fadeInUp 0.8s ease-out';
        
        const exportBtn = document.getElementById('export-spotify');
        exportBtn.style.display = 'inline-flex';
        exportBtn.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
    }

    renderPlaylistPreview(playlistName, tracks) {
        const previewDiv = document.getElementById('playlist-preview');
        previewDiv.innerHTML = `
            <h3>
                <i class="fas fa-music" style="margin-right: var(--space-sm); color: var(--primary-color);"></i>
                ${playlistName}
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
                <i class="fas fa-list" style="margin-right: var(--space-xs);"></i>
                ${tracks.length} canción${tracks.length !== 1 ? 'es' : ''} en la playlist
            </p>
            <ul>
                ${tracks.map((track, idx) => `
                    <li>
                        <img src='${track.album.image || 'https://via.placeholder.com/50?text=🎵'}' alt='${track.album.name}'>
                        <div class="track-info">
                            <div class="track-name">${track.name}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <button class="remove-track-preview" data-idx='${idx}' title='Eliminar canción'>
                            <i class='fas fa-times'></i>
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
        
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
            this.showMessage('Primero genera la vista previa de la playlist.', 'warning');
            return;
        }
        
        const playlistName = document.getElementById('playlist-name').value.trim();
        
        try {
            const loadingDiv = document.getElementById('loading');
            loadingDiv.style.display = 'block';
            
            // Crear la playlist
            const response = await fetch(`${this.config.apiUrl}/me/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    public: false,
                    description: 'Creada con Tuneuptify 🎵'
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
                
                this.showMessage(`
                    <div style="text-align: center;">
                        <i class="fas fa-check-circle" style="font-size: 2rem; color: var(--success-color); margin-bottom: var(--space-sm);"></i>
                        <h4>¡Playlist creada con éxito!</h4>
                        <p>Tu playlist "${playlistName}" ha sido exportada a Spotify</p>
                        <a href='https://open.spotify.com/playlist/${playlist.id}' target='_blank' class='btn btn-success' style="margin-top: var(--space-md);">
                            <i class='fab fa-spotify'></i> Abrir en Spotify
                        </a>
                    </div>
                `, 'success');
                
                document.getElementById('playlist-preview').style.display = 'none';
                document.getElementById('export-spotify').style.display = 'none';
                this.selectedTracks = [];
                this.renderSelectedTracks();
            } else {
                throw new Error('Error al crear la playlist');
            }
        } catch (error) {
            this.showMessage(`Error al exportar la playlist: ${error.message}`, 'error');
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
            this.showMessage('Esta canción ya está en la lista', 'warning');
            return;
        }
        
        const newTrack = {
            uri: track.uri,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: {
                name: track.album.name,
                image: track.album.images[0]?.url
            }
        };
        
        this.selectedTracks.push(newTrack);
        this.renderSelectedTracks();
        
        // Actualizar la vista previa si está visible
        if (document.getElementById('playlist-preview').style.display !== 'none') {
            this.previewTracks.push(newTrack);
            this.renderPlaylistPreview(document.getElementById('playlist-name').value.trim(), this.previewTracks);
        }
        
        // Mostrar confirmación
        this.showMessage(`"${track.name}" agregada a la lista`, 'success');
    }

    removeTrack(uri) {
        const track = this.selectedTracks.find(t => t.uri === uri);
        this.selectedTracks = this.selectedTracks.filter(track => track.uri !== uri);
        this.renderSelectedTracks();
        
        // Actualizar la vista previa si está visible
        if (document.getElementById('playlist-preview').style.display !== 'none') {
            this.previewTracks = this.previewTracks.filter(track => track.uri !== uri);
            this.renderPlaylistPreview(document.getElementById('playlist-name').value.trim(), this.previewTracks);
        }
        
        if (track) {
            this.showMessage(`"${track.name}" removida de la lista`, 'warning');
        }
    }

    renderSelectedTracks() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        selectedTracksDiv.innerHTML = '';
        
        if (this.selectedTracks.length === 0) {
            selectedTracksDiv.innerHTML = `
                <div style="text-align: center; padding: var(--space-lg); color: var(--text-secondary);">
                    <i class="fas fa-music" style="font-size: 2rem; margin-bottom: var(--space-sm); opacity: 0.5;"></i>
                    <p>No hay canciones seleccionadas</p>
                    <p style="font-size: var(--text-sm);">Busca y agrega canciones específicas arriba</p>
                </div>
            `;
            return;
        }
        
        this.selectedTracks.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.style.animation = `slideInLeft 0.5s ease-out ${index * 0.1}s both`;
            trackDiv.innerHTML = `
                <img src="${track.album.image || 'https://via.placeholder.com/50?text=🎵'}" alt="${track.album.name}">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <button class="remove-track" data-uri="${track.uri}" title="Eliminar canción">
                    <i class="fas fa-times"></i>
                </button>
            `;
            trackDiv.querySelector('.remove-track').onclick = () => this.removeTrack(track.uri);
            selectedTracksDiv.appendChild(trackDiv);
        });
    }
}

// Inicializar el gestor de playlists y exponer método para agregar canciones específicas
window.playlistManager = new PlaylistManager(); 