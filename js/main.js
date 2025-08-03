// ===== ELEGANT MAIN JAVASCRIPT =====

// Hacer la función global inmediatamente
window.removeTrackFromPreview = function(index) {
    console.log('removeTrackFromPreview llamado con índice:', index);
    
    if (!window.currentPlaylistTracks) {
        console.error('No hay tracks disponibles');
        return;
    }
    
    console.log('Tracks antes de eliminar:', window.currentPlaylistTracks.length);
    
    // Eliminar la canción del array
    window.currentPlaylistTracks.splice(index, 1);
    
    console.log('Tracks después de eliminar:', window.currentPlaylistTracks.length);
    
    // Actualizar la vista previa
    const data = {
        success: true,
        playlistName: document.getElementById('playlist-name').value,
        tracks: window.currentPlaylistTracks
    };
    
    displayPlaylistPreview(data);
    showNotification('Canción eliminada de la playlist', 'info');
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Tuneuptify elegante cargado');
    
    // Inicializar todas las funcionalidades elegantes
    initCustomCursor();
    initEntranceAnimations();
    initParticleEffects();
    initFormInteractions();
    
    // Configurar eventos de autenticación
    setupAuthEvents();
    
    // Configurar eventos de formulario
    setupFormEvents();
    
    // Configurar listener de hash
    setupHashListener();
    
    // Configurar botón de atrás
    setupBackButton();
    
    // Verificar si viene del dashboard para mostrar el formulario de crear playlist
    checkHashAndShowPlaylistForm();
    
    // Inicializar SearchManager para búsqueda de canciones
    if (typeof SearchManager !== 'undefined') {
        window.searchManager = new SearchManager();
    }
});

// ===== CURSOR PERSONALIZADO =====
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (!cursor || !follower) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 50);
    });
    
    // Efectos de hover
    const interactiveElements = document.querySelectorAll('button, .action-card, .stat-card, .social-link, .hero-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            follower.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
        });
    });
}

// ===== ANIMACIONES DE ENTRADA =====
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

// ===== EFECTOS DE PARTÍCULAS =====
function initParticleEffects() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 1}s`;
    });
}

// ===== INTERACCIONES DE FORMULARIO =====
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

// ===== CONFIGURACIÓN DE EVENTOS DE AUTENTICACIÓN =====
function setupAuthEvents() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            // Efecto de ripple
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
        });
    }
}

// ===== CONFIGURACIÓN DE EVENTOS DE FORMULARIO =====
function setupFormEvents() {
    console.log('Configurando eventos de formulario...');
    
    // Event listener para agregar artista
    const addArtistButton = document.getElementById('add-artist');
    if (addArtistButton) {
        console.log('Agregando event listener para botón agregar artista');
        addArtistButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón agregar artista clickeado');
            addArtistInput();
            
            // Efecto de ripple
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
        });
    } else {
        console.error('No se encontró el botón add-artist');
    }

    // Event listener para vista previa
    const previewButton = document.getElementById('preview-playlist');
    if (previewButton) {
        console.log('Agregando event listener para botón vista previa');
        previewButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón vista previa clickeado');
            previewPlaylist();
            
            // Efecto de ripple
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
        });
    } else {
        console.error('No se encontró el botón preview-playlist');
    }

    // Event listener para exportar a Spotify
    const exportButton = document.getElementById('export-spotify');
    if (exportButton) {
        console.log('Agregando event listener para botón exportar');
        exportButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón exportar clickeado');
            exportToSpotify();
            
            // Efecto de ripple
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
        });
    } else {
        console.error('No se encontró el botón export-spotify');
    }

    // Configurar autocompletado para artistas
    setupArtistAutocomplete();
}

// ===== AUTocompletado DE ARTISTAS =====
function setupArtistAutocomplete() {
    // Configurar autocompletado para el artista principal
    setupAutocompleteForArtist('artist-main');
}

function setupAutocompleteForArtist(artistId) {
    const artistInput = document.getElementById(artistId);
    const suggestionsDiv = document.getElementById(artistId + '-suggestions');
    
    if (!artistInput || !suggestionsDiv) {
        console.error(`No se encontraron elementos para autocompletado de artista: ${artistId}`);
        return;
    }
    
    console.log(`Configurando autocompletado para artista: ${artistId}`);
    let debounceTimeout;
    
    artistInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length < 2) {
            suggestionsDiv.innerHTML = '';
            return;
        }
        
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            searchArtists(query, suggestionsDiv, artistInput);
        }, 300);
    });
    
    artistInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsDiv.innerHTML = '';
        }, 200);
    });
}

async function searchArtists(query, suggestionsDiv, artistInput) {
    try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
            console.error('No hay token de acceso');
            return;
        }
        
        console.log('Buscando artistas:', query);
        
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
            displayArtistResults(data.artists.items, suggestionsDiv, artistInput);
        }
    } catch (error) {
        console.error('Error al buscar artistas:', error);
        suggestionsDiv.innerHTML = '<div class="error">Error al buscar artistas</div>';
    }
}

function displayArtistResults(artists, suggestionsDiv, artistInput) {
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

// ===== VISTA PREVIA DE PLAYLIST =====
async function previewPlaylist() {
    const playlistName = document.getElementById('playlist-name').value;
    const artistMain = document.getElementById('artist-main').value;
    const songsPerArtist = document.getElementById('songs-per-artist').value;
    
    if (!playlistName || !artistMain) {
        showNotification('Por favor, completa el nombre de la playlist y el artista principal', 'error');
        return;
    }
    
    showLoadingAnimation();
    
    try {
        // Recopilar todos los artistas
        const artists = [artistMain];
        const additionalArtists = document.querySelectorAll('#artist-inputs input');
        additionalArtists.forEach(input => {
            if (input.value.trim()) {
                artists.push(input.value.trim());
            }
        });
        
        console.log('Enviando datos para vista previa:', {
            playlistName,
            artists,
            trackCount: parseInt(songsPerArtist)
        });
        
        // Usar la API de Spotify directamente desde el frontend
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
            throw new Error('No hay token de acceso');
        }
        
        const allTracks = [];
        
        // Buscar canciones para cada artista
        for (const artistQuery of artists) {
            if (!artistQuery.trim()) continue;
            
            // Buscar el artista
            const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!searchResponse.ok) continue;
            
            const searchData = await searchResponse.json();
            if (!searchData.artists || !searchData.artists.items.length) continue;
            
            // Usar el primer artista encontrado
            const artist = searchData.artists.items[0];
            
            // Obtener las mejores canciones del artista
            const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=ES`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!tracksResponse.ok) continue;
            
            const tracksData = await tracksResponse.json();
            const tracks = tracksData.tracks.slice(0, parseInt(songsPerArtist));
            
            tracks.forEach(track => {
                allTracks.push({
                    uri: track.uri,
                    name: track.name,
                    artist: artist.name,
                    duration: track.duration_ms,
                    preview_url: track.preview_url,
                    external_url: track.external_urls.spotify,
                    album: {
                        name: track.album.name,
                        image: track.album.images[0]?.url || null
                    }
                });
            });
        }
        
        if (allTracks.length === 0) {
            throw new Error('No se encontraron canciones para los artistas proporcionados');
        }
        
        const data = {
            success: true,
            message: 'Playlist creada localmente',
            playlistId: 'playlist_' + Date.now(),
            playlistName: playlistName,
            tracks: allTracks
        };
        
        displayPlaylistPreview(data);
        showNotification('Playlist creada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear la playlist: ' + error.message, 'error');
    } finally {
        hideLoadingAnimation();
    }
}

function displayPlaylistPreview(data) {
    const previewDiv = document.getElementById('playlist-preview');
    const exportButton = document.getElementById('export-spotify');
    
    if (!previewDiv) return;
    
    // Guardar los tracks en una variable global para poder eliminarlos
    window.currentPlaylistTracks = data.tracks;
    
    // Obtener las canciones específicas seleccionadas
    const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
    
    // Combinar todas las canciones para la vista previa
    const allTracks = [...data.tracks, ...selectedTracks];
    
    previewDiv.innerHTML = `
        <div class="preview-header">
            <h4>Vista previa: ${data.playlistName}</h4>
            <p>${allTracks.length} canciones encontradas</p>
        </div>
        <div class="preview-tracks">
            ${allTracks.map((track, index) => `
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



// ===== EXPORTAR A SPOTIFY =====
async function exportToSpotify() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
        showNotification('No hay token de acceso. Por favor, inicia sesión nuevamente.', 'error');
        return;
    }

    if (!window.currentPlaylistTracks || window.currentPlaylistTracks.length === 0) {
        showNotification('No hay canciones en la playlist para exportar', 'error');
        return;
    }

    const playlistName = document.getElementById('playlist-name').value;
    if (!playlistName) {
        showNotification('Por favor, ingresa un nombre para la playlist', 'error');
        return;
    }

    showLoadingAnimation();
    
    try {
        // 1. Obtener el ID del usuario
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Error al obtener información del usuario');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // 2. Crear la playlist
        const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: 'Playlist creada con Tuneuptify',
                public: false
            })
        });

        if (!createPlaylistResponse.ok) {
            throw new Error('Error al crear la playlist');
        }

        const playlistData = await createPlaylistResponse.json();
        const playlistId = playlistData.id;

        // 3. Agregar las canciones a la playlist
        let trackUris = window.currentPlaylistTracks.map(track => track.uri);
        
        // Agregar también las canciones específicas seleccionadas
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        const selectedTrackUris = selectedTracks.map(track => track.uri);
        
        // Combinar todas las canciones (evitando duplicados)
        const allTrackUris = [...new Set([...trackUris, ...selectedTrackUris])];
        
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: allTrackUris
            })
        });

        if (!addTracksResponse.ok) {
            throw new Error('Error al agregar canciones a la playlist');
        }

        showNotification('¡Playlist exportada exitosamente a Spotify!', 'success');
        
        // Limpiar formulario
        document.getElementById('playlist-form').reset();
        document.getElementById('playlist-preview').style.display = 'none';
        document.getElementById('export-spotify').style.display = 'none';
        document.getElementById('artist-inputs').innerHTML = '';
        window.currentPlaylistTracks = [];

        // Opcional: Abrir la playlist en Spotify
        setTimeout(() => {
            window.open(playlistData.external_urls.spotify, '_blank');
        }, 1000);

    } catch (error) {
        console.error('Error al exportar playlist:', error);
        showNotification('Error al exportar la playlist: ' + error.message, 'error');
    } finally {
        hideLoadingAnimation();
    }
}

// ===== VERIFICAR HASH Y MOSTRAR FORMULARIO =====
function checkHashAndShowPlaylistForm() {
    console.log('Verificando hash de URL:', window.location.hash);
    
    // Verificar si hay un hash en la URL
    if (window.location.hash === '#playlist-section') {
        console.log('Detectado hash #playlist-section, mostrando formulario de crear playlist');
        
        // Esperar un poco para asegurar que el DOM esté completamente cargado
        setTimeout(() => {
            showPlaylistForm();
        }, 100);
    } else {
        console.log('No se detectó hash #playlist-section');
    }
}

// ===== CONFIGURAR BOTÓN DE ATRÁS =====
function setupBackButton() {
    const backButton = document.getElementById('back-to-dashboard');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
}

// ===== MOSTRAR FORMULARIO DE PLAYLIST =====
function showPlaylistForm() {
    console.log('Mostrando formulario de playlist...');
    
    // Mostrar botón de atrás
    const backButton = document.getElementById('back-to-dashboard');
    if (backButton) {
        backButton.style.display = 'flex';
    }
    
    // Ocultar las secciones principales
    const heroSection = document.querySelector('.hero-parallax');
    const featuresSection = document.querySelector('.features-section');
    
    if (heroSection) {
        console.log('Ocultando sección hero');
        heroSection.style.display = 'none';
    }
    
    if (featuresSection) {
        console.log('Ocultando sección features');
        featuresSection.style.display = 'none';
    }
    
    // Mostrar la sección de playlist
    const playlistSection = document.getElementById('playlist-section');
    if (playlistSection) {
        console.log('Mostrando sección de playlist');
        playlistSection.style.display = 'block';
        
        // Scroll suave hacia el formulario
        setTimeout(() => {
            playlistSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
        
        // Agregar animación de entrada
        playlistSection.style.opacity = '0';
        playlistSection.style.transform = 'translateY(30px)';
        playlistSection.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            playlistSection.style.opacity = '1';
            playlistSection.style.transform = 'translateY(0)';
        }, 200);
        
        // Limpiar el hash de la URL sin recargar la página
        history.replaceState(null, null, window.location.pathname);
    } else {
        console.error('No se encontró la sección de playlist');
    }
}

// ===== ESCUCHAR CAMBIOS EN EL HASH =====
function setupHashListener() {
    window.addEventListener('hashchange', function() {
        console.log('Hash cambiado a:', window.location.hash);
        if (window.location.hash === '#playlist-section') {
            showPlaylistForm();
        }
    });
}

// ===== FUNCIONES AUXILIARES =====
function addArtistInput() {
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
                   placeholder="Nombre del artista adicional" 
                   autocomplete="off">
            <div class="autocomplete-suggestions" id="${artistId}-suggestions"></div>
        </div>
        <button type="button" class="remove-artist-btn" onclick="removeArtist(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    artistInputs.appendChild(newRow);
    
    // Configurar autocompletado para el nuevo artista
    setupAutocompleteForArtist(artistId);
    
    // Animación de entrada
    setTimeout(() => {
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateX(0)';
    }, 50);
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
    
    // Estilos elegantes
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
    
    // Colores según tipo
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Contenido de la notificación
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// ===== FUNCIONES GLOBALES =====
window.addArtistInput = addArtistInput;
window.removeArtist = removeArtist;
window.showNotification = showNotification;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation; 