class SearchManager {
    constructor() {
        this.config = window.config;
        this.auth = new Auth();
        this.setupEventListeners();
        console.log('SearchManager inicializado');
        
        // Verificar si hay canciones seleccionadas al inicializar
        this.checkSelectedTracks();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('track-search');
        const suggestionsDiv = document.getElementById('search-suggestions');
        
        if (searchInput && suggestionsDiv) {
            console.log('Configurando event listeners para búsqueda de canciones');
            let debounceTimeout;
            
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim();
                if (query.length < 1) {
                    suggestionsDiv.innerHTML = '';
                    suggestionsDiv.classList.remove('show');
                    return;
                }
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => this.searchTracks(query, suggestionsDiv, searchInput), 300);
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    suggestionsDiv.innerHTML = '';
                    suggestionsDiv.classList.remove('show');
                }, 200);
            });
        } else {
            console.warn('No se encontraron elementos para búsqueda de canciones');
        }
    }

    async searchTracks(query, suggestionsDiv, searchInput) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                console.error('No hay token de acceso para búsqueda de canciones');
                suggestionsDiv.innerHTML = '<div class="error">No hay token de acceso</div>';
                return;
            }

            console.log('Buscando canciones:', query);
            
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const data = await response.json();

            if (data.tracks && data.tracks.items) {
                this.displayResults(data.tracks.items, suggestionsDiv, searchInput);
            } else {
                suggestionsDiv.innerHTML = '<div class="no-results">No se encontraron canciones</div>';
            }
        } catch (error) {
            console.error('Error al buscar canciones:', error);
            suggestionsDiv.innerHTML = '<div class="error">Error al buscar canciones</div>';
        }
    }

    displayResults(tracks, suggestionsDiv, searchInput) {
        suggestionsDiv.innerHTML = '';

        // Agregar mensaje informativo
        if (tracks.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'suggestion-info-message';
            infoDiv.innerHTML = '<i class="fas fa-info-circle"></i> Mostrando los 5 mejores resultados';
            suggestionsDiv.appendChild(infoDiv);
        }

        tracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'autocomplete-suggestion';
            trackDiv.innerHTML = `
                <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/32?text=🎵'}" alt="${track.album.name}">
                <span>${track.name} <span style="color:#1db954;">${track.artists.map(artist => artist.name).join(', ')}</span></span>
            `;
            
            trackDiv.addEventListener('click', () => {
                this.addTrack(track);
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.classList.remove('show');
                searchInput.value = '';
            });
            
            suggestionsDiv.appendChild(trackDiv);
        });

        // Mostrar las sugerencias
        if (tracks.length > 0) {
            suggestionsDiv.classList.add('show');
        } else {
            suggestionsDiv.classList.remove('show');
        }
    }

    addTrack(track) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        // Verificar si la canción ya está en la lista
        if (selectedTracks.some(t => t.uri === track.uri)) {
            showNotification('Esta canción ya está en la lista', 'warning');
            return;
        }

        // Agregar la canción a la lista
        selectedTracks.push({
            uri: track.uri,
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: {
                name: track.album.name,
                image: track.album.images[0]?.url
            }
        });

        localStorage.setItem('selectedTracks', JSON.stringify(selectedTracks));
        this.updateSelectedTracksList();
        showNotification('Canción agregada a la lista', 'success');
        
        // Actualizar automáticamente la vista previa si existe
        this.updatePlaylistPreview();
    }

    removeTrack(uri) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        const updatedTracks = selectedTracks.filter(track => track.uri !== uri);
        localStorage.setItem('selectedTracks', JSON.stringify(updatedTracks));
        this.updateSelectedTracksList();
        showNotification('Canción removida de la lista', 'info');
        
        // Actualizar automáticamente la vista previa
        this.updatePlaylistPreview();
    }

    updateSelectedTracksList() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        if (!selectedTracksDiv) return;
        
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');

        selectedTracksDiv.innerHTML = '';

        if (selectedTracks.length === 0) {
            selectedTracksDiv.innerHTML = '<div class="no-tracks">No hay canciones seleccionadas</div>';
            return;
        }

        selectedTracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.innerHTML = `
                <img src="${track.album.image || 'https://via.placeholder.com/40?text=🎵'}" alt="${track.album.name}">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <button class="remove-track" data-uri="${track.uri}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const removeButton = trackDiv.querySelector('.remove-track');
            removeButton.addEventListener('click', () => this.removeTrack(track.uri));

            selectedTracksDiv.appendChild(trackDiv);
        });
    }

    updatePlaylistPreview() {
        const previewDiv = document.getElementById('playlist-preview');
        if (!previewDiv) return;
        
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        if (selectedTracks.length === 0) {
            previewDiv.style.display = 'none';
            return;
        }
        
        // Obtener el nombre de la playlist del formulario
        const playlistName = document.getElementById('playlist-name')?.value || 'Mi Playlist';
        
        // Crear la vista previa con solo las canciones seleccionadas
        const data = {
            success: true,
            playlistName: playlistName,
            tracks: selectedTracks
        };
        
        // Llamar a la función global de vista previa
        if (typeof displayPlaylistPreview === 'function') {
            displayPlaylistPreview(data);
        } else {
            // Si la función no está disponible, crear una vista previa básica
            this.createBasicPreview(data);
        }
    }

    createBasicPreview(data) {
        const previewDiv = document.getElementById('playlist-preview');
        const exportButton = document.getElementById('export-spotify');
        
        if (!previewDiv) return;
        
        previewDiv.innerHTML = `
            <div class="preview-header">
                <h4>Vista previa: ${data.playlistName}</h4>
                <p>${data.tracks.length} canciones seleccionadas</p>
            </div>
            <div class="preview-tracks">
                ${data.tracks.map((track, index) => `
                    <div class="preview-track" data-track-index="${index}">
                        <img src="${track.album.image || 'https://via.placeholder.com/40?text=🎵'}" alt="${track.album.name}">
                        <div class="track-info">
                            <div class="track-name">${track.name}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <button class="remove-track-btn" onclick="removeTrackFromPreview(${index})" title="Eliminar canción">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        previewDiv.style.display = 'block';
        if (exportButton) {
            exportButton.style.display = 'block';
        }
    }

    checkSelectedTracks() {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        if (selectedTracks.length > 0) {
            // Si hay canciones seleccionadas, mostrar la vista previa automáticamente
            setTimeout(() => {
                this.updatePlaylistPreview();
            }, 500); // Pequeño delay para asegurar que el DOM esté listo
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Inicializar el gestor de búsqueda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no existe ya una instancia
    if (!window.searchManager) {
        window.searchManager = new SearchManager();
    }
}); 