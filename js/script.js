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
            // Preparar datos para enviar al servidor
            const formData = new FormData();
            formData.append('artists', JSON.stringify(artists));
            formData.append('playlistName', playlistName);
            formData.append('tracksPerArtist', trackCount);

            const response = await fetch('search.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                displayTracks(data.tracks);
                
                // Crear botón de autenticación
                const authButton = document.createElement('a');
                authButton.href = '#';
                authButton.className = 'spotify-link';
                authButton.textContent = 'Create Playlist in Spotify';
                
                // Manejar el proceso de autenticación y creación de playlist
                authButton.addEventListener('click', async function(e) {
                    e.preventDefault();
                    
                    try {
                        // Primero intentamos abrir Spotify Desktop
                        window.location.href = 'spotify:';
                        
                        // Esperamos un momento y luego iniciamos el proceso de autenticación
                        setTimeout(() => {
                            // Guardamos la URL actual para volver después
                            sessionStorage.setItem('spotify_return_url', window.location.href);
                            // Redirigimos a la página de autenticación
                            window.location.href = data.auth_url;
                        }, 1000);
                    } catch (error) {
                        console.error('Error initiating Spotify auth:', error);
                        alert('Error connecting to Spotify. Please try again.');
                    }
                });
                
                resultContainer.appendChild(authButton);
            } else {
                resultContainer.innerHTML = `<p class="message">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            resultContainer.innerHTML = '<p class="message">An error occurred while creating the playlist</p>';
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