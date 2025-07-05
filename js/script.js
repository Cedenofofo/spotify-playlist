document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM
    const artistsContainer = document.querySelector('.artist-inputs');
    const addArtistBtn = document.getElementById('addArtist');
    const createPlaylistBtn = document.getElementById('createPlaylist');

    // Manejador para agregar nuevo campo de artista
    addArtistBtn.addEventListener('click', function() {
        const newArtistGroup = document.createElement('div');
        newArtistGroup.className = 'artist-input-group';
        newArtistGroup.innerHTML = `
            <input type="text" class="artist-input" placeholder="Enter artist name..." required>
            <button type="button" class="remove-artist">×</button>
        `;
        artistsContainer.appendChild(newArtistGroup);

        // Mostrar botón de eliminar para todos excepto el primero
        document.querySelectorAll('.remove-artist').forEach(btn => {
            btn.style.display = 'block';
        });
    });

    // Manejador para eliminar campo de artista
    artistsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-artist')) {
            e.target.parentElement.remove();
            
            // Ocultar botón de eliminar si solo queda uno
            const removeButtons = document.querySelectorAll('.remove-artist');
            if (removeButtons.length === 1) {
                removeButtons[0].style.display = 'none';
            }
        }
    });

    // Manejador principal para crear la playlist
    createPlaylistBtn.addEventListener('click', async function() {
        const playlistName = document.getElementById('playlistName').value.trim();
        const trackCount = document.getElementById('trackCount').value;
        const artistInputs = document.querySelectorAll('.artist-input');
        const resultContainer = document.getElementById('playlistInfo');
        
        if (!playlistName) {
            alert('Please enter a playlist name');
            return;
        }

        const artists = Array.from(artistInputs)
            .map(input => input.value.trim())
            .filter(artist => artist !== '');

        if (artists.length === 0) {
            alert('Please enter at least one artist');
            return;
        }

        try {
            // Buscar canciones de los artistas usando la API de Spotify directamente
            // NOTA: El usuario debe estar autenticado y tener un access_token
            const accessToken = localStorage.getItem('spotify_access_token');
            if (!accessToken) {
                alert('Debes iniciar sesión con Spotify primero.');
                return;
            }

            let allTracks = [];
            for (const artist of artists) {
                const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=track&limit=${trackCount}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const data = await response.json();
                if (data.tracks && data.tracks.items) {
                    allTracks = allTracks.concat(data.tracks.items);
                }
            }

            if (allTracks.length > 0) {
                displayTracks(allTracks);
                // Crear botón para crear playlist en Spotify
                const createPlaylistBtn = document.createElement('button');
                createPlaylistBtn.textContent = 'Crear Playlist en Spotify';
                createPlaylistBtn.className = 'spotify-link';
                createPlaylistBtn.addEventListener('click', async function() {
                    try {
                        // Obtener el nombre del usuario
                        const userRes = await fetch('https://api.spotify.com/v1/me', {
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        });
                        const userData = await userRes.json();
                        // Crear la playlist
                        const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: playlistName,
                                description: 'Playlist generada automáticamente',
                                public: true
                            })
                        });
                        const playlistData = await playlistRes.json();
                        // Añadir canciones a la playlist
                        const uris = allTracks.map(track => track.uri);
                        await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ uris })
                        });
                        alert('¡Playlist creada con éxito!');
                        window.open(playlistData.external_urls.spotify, '_blank');
                    } catch (error) {
                        alert('Error al crear la playlist en Spotify.');
                    }
                });
                resultContainer.appendChild(createPlaylistBtn);
            } else {
                resultContainer.innerHTML = '<p class="message">No se encontraron canciones para los artistas ingresados.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultContainer.innerHTML = '<p class="message">Ocurrió un error al crear la playlist</p>';
        }
    });

    // Verificar si hay un mensaje de éxito o error después de la autenticación
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    
    if (status && message) {
        const resultContainer = document.getElementById('result');
        resultContainer.innerHTML = `<p class="message ${status}">${message}</p>`;
        
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Función para mostrar las canciones en la interfaz
function displayTracks(tracks) {
    const playlistInfo = document.getElementById('playlistInfo');
    let html = '<h2>Selected Tracks</h2>';
    
    // Agrupar canciones por artista para mejor visualización
    const tracksByArtist = tracks.reduce((acc, track) => {
        const artistName = track.artists[0].name;
        if (!acc[artistName]) {
            acc[artistName] = [];
        }
        acc[artistName].push(track);
        return acc;
    }, {});

    // Mostrar canciones agrupadas por artista
    Object.entries(tracksByArtist).forEach(([artist, artistTracks]) => {
        html += `<h3>${artist}</h3>`;
        artistTracks.forEach((track, index) => {
            html += `
                <div class="track-item">
                    <span class="track-number">${index + 1}</span>
                    <div class="track-info">
                        <div class="track-name">${track.name}</div>
                        <div class="track-artist">${track.album.name}</div>
                    </div>
                </div>
            `;
        });
    });
    
    playlistInfo.innerHTML = html;
} 