window.removeTrackFromPreview = function(index) {
    if (!window.currentPlaylistTracks) {
        return;
    }
    
    const trackToRemove = window.currentPlaylistTracks[index];
    window.currentPlaylistTracks.splice(index, 1);
    
    if (trackToRemove && trackToRemove.uri) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        const updatedSelectedTracks = selectedTracks.filter(track => track.uri !== trackToRemove.uri);
        localStorage.setItem('selectedTracks', JSON.stringify(updatedSelectedTracks));
        
        if (window.searchManager && typeof window.searchManager.updateSelectedTracksList === 'function') {
            window.searchManager.updateSelectedTracksList();
        }
    }
    
    const data = {
        success: true,
        playlistName: document.getElementById('playlist-name').value,
        tracks: window.currentPlaylistTracks
    };
    
    displayPlaylistPreview(data);
    showNotification('Canción eliminada de la playlist', 'info');
};

document.addEventListener('DOMContentLoaded', () => {
    initEntranceAnimations();
    initParticleEffects();
    initFormInteractions();
    setupAuthEvents();
    setupFormEvents();
    setupHashListener();
    checkHashAndShowPlaylistForm();
});

function initEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.welcome-card, .hero-features, .playlist-form-container, .section-header');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

function initParticleEffects() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 1}s`;
    });
}

function initFormInteractions() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.style.transform = 'scale(1.02)';
                wrapper.style.boxShadow = '0 0 0 3px rgba(29, 185, 84, 0.2)';
            }
        });
        
        input.addEventListener('blur', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.style.transform = 'scale(1)';
                wrapper.style.boxShadow = 'none';
            }
        });
    });
}

function setupAuthEvents() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const clientId = 'tu-client-id';
            const redirectUri = encodeURIComponent(window.location.origin + '/callback.html');
            const scopes = encodeURIComponent('playlist-modify-public playlist-modify-private user-read-private user-read-email');
            
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=true`;
            
            window.location.href = authUrl;
        });
    }
}

function setupFormEvents() {
    const playlistForm = document.getElementById('playlist-form');
    if (playlistForm) {
        playlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            previewPlaylist();
        });
    }
    
    setupArtistAutocomplete();
}

function setupArtistAutocomplete() {
    const artistInputs = document.querySelectorAll('.artist-input');
    artistInputs.forEach(input => {
        setupAutocompleteForArtist(input.id);
    });
}

function setupAutocompleteForArtist(artistId) {
    const artistInput = document.getElementById(artistId);
    const suggestionsDiv = document.getElementById(`${artistId}-suggestions`);
    
    if (!artistInput || !suggestionsDiv) return;
    
    artistInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        try {
            await searchArtists(query, suggestionsDiv, artistInput);
        } catch (error) {
            console.error('Error searching artists:', error);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!artistInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

async function searchArtists(query, suggestionsDiv, artistInput) {
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
        showNotification('No hay token de acceso. Inicia sesión nuevamente.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayArtistResults(data.artists.items, suggestionsDiv, artistInput);
    } catch (error) {
        console.error('Error searching artists:', error);
        showNotification('Error al buscar artistas', 'error');
    }
}

function displayArtistResults(artists, suggestionsDiv, artistInput) {
    suggestionsDiv.innerHTML = '';
    
    if (artists.length === 0) {
        suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">No se encontraron artistas</div>';
        suggestionsDiv.style.display = 'block';
        return;
    }
    
    artists.forEach(artist => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `
            <img src="${artist.images[0]?.url || 'img/placeholder-artist.jpg'}" alt="${artist.name}">
            <div class="suggestion-info">
                <div class="suggestion-title">${artist.name}</div>
                <div class="suggestion-subtitle">${artist.followers.total.toLocaleString()} seguidores</div>
            </div>
        `;
        
        suggestionItem.addEventListener('click', () => {
            artistInput.value = artist.name;
            artistInput.dataset.artistId = artist.id;
            suggestionsDiv.style.display = 'none';
        });
        
        suggestionsDiv.appendChild(suggestionItem);
    });
    
    suggestionsDiv.style.display = 'block';
}

async function previewPlaylist() {
    const playlistName = document.getElementById('playlist-name').value.trim();
    const artistInputs = document.querySelectorAll('.artist-input');
    
    if (!playlistName) {
        showNotification('Por favor ingresa un nombre para la playlist', 'error');
        return;
    }
    
    const artists = [];
    artistInputs.forEach(input => {
        const artistName = input.value.trim();
        const artistId = input.dataset.artistId;
        if (artistName && artistId) {
            artists.push({ name: artistName, id: artistId });
        }
    });
    
    if (artists.length === 0) {
        showNotification('Por favor agrega al menos un artista', 'error');
        return;
    }
    
    showLoadingAnimation();
    
    try {
        const accessToken = localStorage.getItem('spotify_access_token');
        if (!accessToken) {
            throw new Error('No hay token de acceso');
        }
        
        const tracks = [];
        
        for (const artist of artists) {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=ES`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error al obtener canciones de ${artist.name}`);
            }
            
            const data = await response.json();
            const artistTracks = data.tracks.slice(0, 5).map(track => ({
                ...track,
                artist_name: artist.name
            }));
            
            tracks.push(...artistTracks);
        }
        
        const previewData = {
            success: true,
            playlistName: playlistName,
            tracks: tracks
        };
        
        displayPlaylistPreview(previewData);
        hideLoadingAnimation();
        
    } catch (error) {
        console.error('Error previewing playlist:', error);
        hideLoadingAnimation();
        showNotification('Error al generar la vista previa', 'error');
    }
}

function displayPlaylistPreview(data) {
    if (!data.success) {
        showNotification('Error al generar la vista previa', 'error');
        return;
    }
    
    window.currentPlaylistTracks = data.tracks;
    
    const previewSection = document.getElementById('playlist-preview');
    const previewContainer = document.getElementById('preview-tracks');
    
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    data.tracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'preview-track';
        trackElement.innerHTML = `
            <img src="${track.album.images[0]?.url || 'img/placeholder-track.jpg'}" alt="${track.name}">
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artists[0].name}</div>
            </div>
            <button class="remove-track-btn" onclick="removeTrackFromPreview(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        previewContainer.appendChild(trackElement);
    });
    
    if (previewSection) {
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showNotification(`Vista previa generada con ${data.tracks.length} canciones`, 'success');
}

async function exportToSpotify() {
    const playlistName = document.getElementById('playlist-name').value.trim();
    const tracks = window.currentPlaylistTracks;
    
    if (!playlistName || !tracks || tracks.length === 0) {
        showNotification('No hay datos para exportar', 'error');
        return;
    }
    
    showLoadingAnimation();
    
    try {
        const accessToken = localStorage.getItem('spotify_access_token');
        if (!accessToken) {
            throw new Error('No hay token de acceso');
        }
        
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Error al obtener información del usuario');
        }
        
        const userData = await userResponse.json();
        
        const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: `Playlist creada con Tuneuptify - ${new Date().toLocaleDateString()}`,
                public: true
            })
        });
        
        if (!createPlaylistResponse.ok) {
            throw new Error('Error al crear la playlist');
        }
        
        const playlistData = await createPlaylistResponse.json();
        
        const trackUris = tracks.map(track => track.uri);
        
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: trackUris
            })
        });
        
        if (!addTracksResponse.ok) {
            throw new Error('Error al agregar canciones a la playlist');
        }
        
        hideLoadingAnimation();
        showNotification('Playlist creada exitosamente en Spotify!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error exporting to Spotify:', error);
        hideLoadingAnimation();
        showNotification('Error al exportar a Spotify', 'error');
    }
}

function checkHashAndShowPlaylistForm() {
    if (window.location.hash === '#create-playlist') {
        showPlaylistForm();
    }
}

function showPlaylistForm() {
    const playlistSection = document.getElementById('playlist-section');
    if (playlistSection) {
        playlistSection.style.display = 'block';
        playlistSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupHashListener() {
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#create-playlist') {
            showPlaylistForm();
        }
    });
}

function addArtistInput() {
    const artistContainer = document.getElementById('artist-container');
    const artistCount = artistContainer.children.length;
    
    if (artistCount >= 5) {
        showNotification('Máximo 5 artistas permitidos', 'warning');
        return;
    }
    
    const artistRow = document.createElement('div');
    artistRow.className = 'artist-row';
    artistRow.innerHTML = `
        <div class="input-wrapper">
            <label for="artist-${artistCount}" class="form-label">
                <i class="fas fa-user"></i>
                <span>Artista ${artistCount + 1}</span>
            </label>
            <input type="text" id="artist-${artistCount}" class="form-input artist-input" 
                   placeholder="Buscar artista..." autocomplete="off">
            <div class="input-glow"></div>
            <div id="artist-${artistCount}-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <button type="button" class="remove-artist-btn" onclick="removeArtist(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    artistContainer.appendChild(artistRow);
    setupAutocompleteForArtist(`artist-${artistCount}`);
}

function removeArtist(button) {
    const row = button.closest('.artist-row');
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        row.remove();
    }, 300);
}

function showLoadingAnimation() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
        loading.style.opacity = '0';
        loading.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            loading.style.opacity = '1';
            loading.style.transform = 'scale(1)';
        }, 50);
    }
}

function hideLoadingAnimation() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            loading.style.display = 'none';
        }, 300);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

window.addArtistInput = addArtistInput;
window.removeArtist = removeArtist;
window.showNotification = showNotification;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation;
window.displayPlaylistPreview = displayPlaylistPreview;

function navigateToPrivacyPolicy() {
    const button = event.currentTarget;
    if (button) {
        button.classList.add('loading');
    }
    
    setTimeout(() => {
        window.location.href = 'privacy-policy.html';
    }, 500);
}

window.navigateToPrivacyPolicy = navigateToPrivacyPolicy; 