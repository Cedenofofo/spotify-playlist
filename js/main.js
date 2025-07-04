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
        this.initializeModernEffects();
    }

    initializeModernEffects() {
        // Add smooth transitions when sections change
        this.addSectionTransitions();
        
        // Add hover effects to interactive elements
        this.addHoverEffects();
        
        // Add loading animations
        this.addLoadingAnimations();
        
        // Add success animations
        this.addSuccessAnimations();
    }

    addSectionTransitions() {
        const loginSection = document.getElementById('login-section');
        const playlistSection = document.getElementById('playlist-section');
        
        if (loginSection && playlistSection) {
            // Smooth transition when switching sections
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        if (target.style.display === 'none') {
                            target.classList.remove('fade-in', 'slide-up');
                        } else {
                            target.classList.add('fade-in');
                            setTimeout(() => target.classList.add('slide-up'), 100);
                        }
                    }
                });
            });
            
            observer.observe(loginSection, { attributes: true });
            observer.observe(playlistSection, { attributes: true });
        }
    }

    addHoverEffects() {
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.spotify-button, .add-artist-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
        });
    }

    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addLoadingAnimations() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            // Add pulsing animation to loading text
            const loadingText = loadingElement.querySelector('p');
            if (loadingText) {
                loadingText.style.animation = 'pulse 2s infinite';
            }
        }
    }

    addSuccessAnimations() {
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            // Add celebration animation when success message appears
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (successMessage.style.display !== 'none') {
                            this.celebrateSuccess();
                        }
                    }
                });
            });
            
            observer.observe(successMessage, { attributes: true });
        }
    }

    celebrateSuccess() {
        // Create confetti effect
        this.createConfetti();
        
        // Add success sound effect (optional)
        this.playSuccessSound();
    }

    createConfetti() {
        const colors = ['#1DB954', '#00cfff', '#ffffff', '#ff6b6b'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: confettiFall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }

    playSuccessSound() {
        // Create a simple success sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Fallback if Web Audio API is not available
            console.log('Audio not supported');
        }
    }

    setupArtistInputs() {
        const artistInputsDiv = document.getElementById('artist-inputs');
        artistInputsDiv.innerHTML = '';
        this.artistInputs = [];
    }

    addArtistInput(value = '') {
        const artistInputsDiv = document.getElementById('artist-inputs');
        const row = document.createElement('div');
        row.className = 'artist-row hover-lift';
        row.style.animation = 'slideUp 0.3s ease-out';
        
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
            row.style.animation = 'slideOut 0.3s ease-out';
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

        // Add modern form interactions
        this.addFormInteractions();
    }

    addFormInteractions() {
        // Add floating label effect
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement?.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement?.classList.remove('focused');
                }
            });
        });

        // Add smooth scrolling to form sections
        const form = document.getElementById('playlist-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.scrollToTop();
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
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
            
            // Add loading state
            input.classList.add('search-loading');
            
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                if (query === lastQuery) return;
                lastQuery = query;
                
                const artists = await this.searchArtists(query);
                suggestionsDiv.innerHTML = '';
                
                if (artists.length === 0) {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.textContent = 'No se encontraron artistas';
                    suggestionsDiv.appendChild(div);
                }
                
                artists.forEach((artist, index) => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.style.animationDelay = `${index * 0.05}s`;
                    div.innerHTML = `<img src='${artist.images[0]?.url || 'https://via.placeholder.com/32?text=🎤'}' alt='${artist.name}'>${artist.name}`;
                    div.onclick = () => {
                        input.value = artist.name;
                        suggestionsDiv.innerHTML = '';
                        input.classList.add('search-highlight');
                        setTimeout(() => input.classList.remove('search-highlight'), 600);
                    };
                    suggestionsDiv.appendChild(div);
                });
                
                // Remove loading state
                input.classList.remove('search-loading');
            }, 300);
        });
        
        input.addEventListener('blur', () => setTimeout(() => suggestionsDiv.innerHTML = '', 200));
    }

    async searchArtists(query) {
        try {
            const token = this.auth.getAccessToken();
            if (!token) {
                this.showToast('Tu sesión de Spotify ha expirado. Por favor, inicia sesión de nuevo.', 'error');
                setTimeout(() => window.location.reload(), 2000);
                return [];
            }
            
            const response = await fetch(`${this.config.apiUrl}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                this.showToast('Tu sesión de Spotify ha expirado. Por favor, inicia sesión de nuevo.', 'error');
                setTimeout(() => window.location.reload(), 2000);
                return [];
            }
            
            if (response.status === 403) {
                this.showToast('No tienes permisos para usar la API de Spotify.', 'error');
                setTimeout(() => window.location.reload(), 2000);
                return [];
            }
            
            if (!response.ok) {
                this.showToast('Error de red o de autenticación con Spotify.', 'error');
                return [];
            }
            
            const data = await response.json();
            if (data.artists && data.artists.items) {
                return data.artists.items;
            }
        } catch (e) {
            this.showToast('Error de red o de autenticación con Spotify.', 'error');
        }
        return [];
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    async previewPlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        const songsPerArtist = parseInt(document.getElementById('songs-per-artist').value);
        const mainArtist = document.getElementById('artist-main').value.trim();
        const artistNames = [mainArtist, ...this.artistInputs.map(input => input.value.trim())].filter(Boolean);
        let allTracks = [...this.selectedTracks];

        if (!playlistName) {
            this.showToast('Por favor, ingresa un nombre para la playlist', 'error');
            return;
        }

        if (artistNames.length > 0) {
            document.getElementById('loading').style.display = 'block';
            for (const artist of artistNames) {
                const tracks = await this.searchTracksByArtist(artist, songsPerArtist);
                for (const t of tracks) {
                    if (!allTracks.some(track => track.uri === t.uri)) {
                        allTracks.push(t);
                    }
                }
            }
            document.getElementById('loading').style.display = 'none';
        }

        if (allTracks.length === 0) {
            this.showToast('Agrega al menos un artista o una canción específica', 'error');
            return;
        }

        this.previewTracks = allTracks;
        this.previewPlaylistId = null;
        this.renderPlaylistPreview(playlistName, allTracks);
        
        const previewDiv = document.getElementById('playlist-preview');
        previewDiv.style.display = 'block';
        previewDiv.classList.add('fade-in');
        
        document.getElementById('export-spotify').style.display = 'inline-block';
        this.showToast(`Vista previa generada con ${allTracks.length} canciones`, 'success');
    }

    renderPlaylistPreview(playlistName, tracks) {
        const previewDiv = document.getElementById('playlist-preview');
        previewDiv.innerHTML = `
            <h3>${playlistName}</h3>
            <ul>
                ${tracks.map((track, idx) => `
                    <li class="hover-lift" style="animation-delay: ${idx * 0.05}s">
                        <img src='${track.album.image || 'https://via.placeholder.com/40?text=🎵'}' alt='${track.album.name}'>
                        <span class='track-name'>${track.name}</span>
                        <span class='track-artist'>${track.artist}</span>
                        <button class='remove-track-preview' data-idx='${idx}' title='Eliminar canción'>
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
                this.showToast('Canción eliminada de la vista previa', 'success');
            };
        });
    }

    async exportToSpotify() {
        if (!this.previewTracks || this.previewTracks.length === 0) {
            this.showToast('Primero genera la vista previa de la playlist.', 'error');
            return;
        }
        
        const playlistName = document.getElementById('playlist-name').value.trim();
        try {
            document.getElementById('loading').style.display = 'block';
            
            // Crear la playlist
            const response = await fetch(`${this.config.apiUrl}/me/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: `Playlist generada con Tuneuptify - ${this.previewTracks.length} canciones`
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear la playlist');
            }

            const playlist = await response.json();
            this.previewPlaylistId = playlist.id;

            // Agregar canciones a la playlist
            const trackUris = this.previewTracks.map(track => track.uri);
            const addTracksResponse = await fetch(`${this.config.apiUrl}/playlists/${playlist.id}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: trackUris
                })
            });

            if (!addTracksResponse.ok) {
                throw new Error('Error al agregar canciones a la playlist');
            }

            document.getElementById('loading').style.display = 'none';
            
            const successMessage = document.getElementById('success-message');
            successMessage.innerHTML = `
                <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
                ¡Playlist creada exitosamente! 
                <a href="${playlist.external_urls.spotify}" target="_blank" style="color: white; text-decoration: underline; margin-left: 0.5rem;">
                    Abrir en Spotify
                </a>
            `;
            successMessage.style.display = 'block';
            
            this.showToast('¡Playlist creada exitosamente en Spotify!', 'success');
            
        } catch (error) {
            document.getElementById('loading').style.display = 'none';
            this.showToast('Error al crear la playlist: ' + error.message, 'error');
        }
    }

    async searchTracksByArtist(artist, limit) {
        try {
            const token = this.auth.getAccessToken();
            const response = await fetch(`${this.config.apiUrl}/search?q=artist:${encodeURIComponent(artist)}&type=track&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.tracks.items.map(track => ({
                uri: track.uri,
                name: track.name,
                artist: track.artists[0].name,
                album: {
                    name: track.album.name,
                    image: track.album.images[0]?.url
                }
            }));
        } catch (e) {
            return [];
        }
    }

    addSpecificTrack(track) {
        if (!this.selectedTracks.some(t => t.uri === track.uri)) {
            this.selectedTracks.push(track);
            this.renderSelectedTracks();
            this.showToast(`"${track.name}" agregada a la selección`, 'success');
        } else {
            this.showToast('Esta canción ya está en la selección', 'error');
        }
    }

    removeTrack(uri) {
        this.selectedTracks = this.selectedTracks.filter(track => track.uri !== uri);
        this.renderSelectedTracks();
        this.showToast('Canción eliminada de la selección', 'success');
    }

    renderSelectedTracks() {
        const container = document.getElementById('selected-tracks');
        if (this.selectedTracks.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 1rem;">No hay canciones seleccionadas</p>';
            return;
        }
        
        container.innerHTML = this.selectedTracks.map((track, index) => `
            <div class="selected-track hover-lift" style="animation-delay: ${index * 0.05}s">
                <img src='${track.album.image || 'https://via.placeholder.com/50?text=🎵'}' alt='${track.album.name}'>
                <div style="flex-grow: 1;">
                    <div style="font-weight: 600; color: var(--text-primary);">${track.name}</div>
                    <div style="font-size: 0.9em; color: var(--text-secondary);">${track.artist}</div>
                </div>
                <button class='remove-track' onclick='playlistManager.removeTrack("${track.uri}")'>
                    <i class='fas fa-times'></i>
                </button>
            </div>
        `).join('');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(-100%);
            opacity: 0;
        }
    }
    
    .focused label {
        color: var(--spotify-green);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Initialize the application
let playlistManager;
document.addEventListener('DOMContentLoaded', () => {
    playlistManager = new PlaylistManager();
}); 