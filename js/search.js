class SearchManager {
    constructor() {
        this.config = window.config;
        this.auth = new Auth();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('track-search');
        const suggestionsDiv = document.getElementById('search-suggestions');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim();
                if (query.length < 1) {
                    suggestionsDiv.innerHTML = '';
                    return;
                }
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => this.searchTracks(query, suggestionsDiv, searchInput), 300);
            });
            searchInput.addEventListener('blur', () => setTimeout(() => suggestionsDiv.innerHTML = '', 200));
        }
    }

    async searchTracks(query, suggestionsDiv, searchInput) {
        try {
            const response = await fetch(`${this.config.apiUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`
                }
            });

            const data = await response.json();

            if (data.tracks && data.tracks.items) {
                this.displayResults(data.tracks.items, suggestionsDiv, searchInput);
            }
        } catch (error) {
            console.error('Error:', error);
            suggestionsDiv.innerHTML = '<div class="error">Error al buscar canciones</div>';
        }
    }

    displayResults(tracks, suggestionsDiv, searchInput) {
        suggestionsDiv.innerHTML = '';

        tracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'autocomplete-suggestion';
            trackDiv.innerHTML = `
                <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/32?text=🎵'}" alt="${track.album.name}">
                <span>${track.name} <span style="color:#1db954;">${track.artists.map(artist => artist.name).join(', ')}</span></span>
            `;
            trackDiv.addEventListener('click', () => {
                if (window.playlistManager) {
                    window.playlistManager.addSpecificTrack(track);
                }
                suggestionsDiv.innerHTML = '';
                searchInput.value = '';
            });
            suggestionsDiv.appendChild(trackDiv);
        });
    }

    addTrack(track) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        // Verificar si la canción ya está en la lista
        if (selectedTracks.some(t => t.uri === track.uri)) {
            alert('Esta canción ya está en la lista');
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
    }

    removeTrack(uri) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        const updatedTracks = selectedTracks.filter(track => track.uri !== uri);
        localStorage.setItem('selectedTracks', JSON.stringify(updatedTracks));
        this.updateSelectedTracksList();
    }

    updateSelectedTracksList() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');

        selectedTracksDiv.innerHTML = '';

        selectedTracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.innerHTML = `
                <img src="${track.album.image || ''}" alt="${track.album.name}">
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

// Inicializar el gestor de búsqueda
new SearchManager(); 