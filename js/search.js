let searchTimeout;
const searchInput = document.getElementById('track-search');
const suggestionsContainer = document.getElementById('search-suggestions');
const selectedTracks = new Set();

searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    // Debounce the search to avoid too many requests
    searchTimeout = setTimeout(() => {
        searchTracks(query);
    }, 300);
});

async function searchTracks(query) {
    try {
        const response = await fetch('/spotify-playlist/search_track.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }

        displaySuggestions(data.tracks);
    } catch (error) {
        console.error('Error searching tracks:', error);
        showError('Error al buscar canciones');
    }
}

function displaySuggestions(tracks) {
    suggestionsContainer.innerHTML = '';
    
    if (tracks.length === 0) {
        suggestionsContainer.innerHTML = '<div class="no-results">No se encontraron canciones</div>';
        return;
    }

    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'suggestions-list';

    tracks.forEach(track => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.innerHTML = `
            <img src="${track.album.image || '/spotify-playlist/img/default-album.png'}" alt="${track.album.name}" class="suggestion-album-img">
            <div class="suggestion-info">
                <div class="suggestion-title">${track.name}</div>
                <div class="suggestion-artist">${track.artist}</div>
            </div>
            <button class="add-track-btn" data-uri="${track.uri}">
                <i class="fas fa-plus"></i>
            </button>
        `;

        suggestion.querySelector('.add-track-btn').addEventListener('click', async () => {
            if (selectedTracks.has(track.uri)) {
                showError('Esta canción ya ha sido añadida');
                return;
            }

            try {
                const playlistId = document.getElementById('playlist-id').value;
                const response = await fetch('/spotify-playlist/search_track.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query,
                        playlistId,
                        trackUri: track.uri
                    })
                });

                const data = await response.json();
                if (data.success) {
                    selectedTracks.add(track.uri);
                    showSuccess('Canción añadida correctamente');
                    updateTracksList(data.track);
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                console.error('Error adding track:', error);
                showError('Error al añadir la canción');
            }
        });

        suggestionsList.appendChild(suggestion);
    });

    suggestionsContainer.appendChild(suggestionsList);
}

function updateTracksList(track) {
    const tracksList = document.getElementById('selected-tracks');
    const trackItem = document.createElement('div');
    trackItem.className = 'track-item';
    trackItem.innerHTML = `
        <img src="${track.album.image || '/spotify-playlist/img/default-album.png'}" alt="${track.album.name}" class="track-album-img">
        <div class="track-info">
            <div class="track-title">${track.name}</div>
            <div class="track-artist">${track.artist}</div>
        </div>
    `;
    tracksList.appendChild(trackItem);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
} 