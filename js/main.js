document.addEventListener('DOMContentLoaded', function() {
    const createPlaylistButton = document.getElementById('create-playlist');
    const loadingSpinner = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const playlistNameInput = document.getElementById('playlist-name');
    const selectedTracksDiv = document.getElementById('selected-tracks');

    if (createPlaylistButton) {
        createPlaylistButton.addEventListener('click', async function() {
            const playlistName = playlistNameInput.value.trim();
            if (!playlistName) {
                alert('Por favor, ingresa un nombre para la playlist');
                return;
            }

            // Obtener las canciones seleccionadas
            const tracks = Array.from(selectedTracksDiv.children).map(track => ({
                uri: track.dataset.uri,
                name: track.dataset.name,
                artist: track.dataset.artist,
                duration: track.dataset.duration,
                preview_url: track.dataset.previewUrl,
                external_url: track.dataset.externalUrl,
                album: {
                    name: track.dataset.albumName,
                    image: track.dataset.albumImage
                }
            }));

            if (tracks.length === 0) {
                alert('Por favor, selecciona al menos una canción');
                return;
            }

            try {
                loadingSpinner.style.display = 'flex';
                createPlaylistButton.disabled = true;

                const response = await fetch('create_playlist.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        playlistName: playlistName,
                        tracks: tracks
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Guardar la información de la playlist en sessionStorage
                    sessionStorage.setItem('currentPlaylist', JSON.stringify({
                        name: playlistName,
                        tracks: tracks
                    }));

                    document.getElementById('playlist-id').value = data.playlistId;
                    successMessage.style.display = 'block';
                } else {
                    throw new Error(data.error || 'Error al crear la playlist');
                }
            } catch (error) {
                alert('Error al crear la playlist: ' + error.message);
            } finally {
                loadingSpinner.style.display = 'none';
                createPlaylistButton.disabled = false;
            }
        });
    }
}); 