class App {
    constructor() {
        this.auth = new Auth();
        this.api = new SpotifyAPI(this.auth);
        this.playlist = [];
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        document.getElementById('login-button').addEventListener('click', () => this.auth.login());
        document.getElementById('logout-button').addEventListener('click', () => this.auth.logout());
        document.getElementById('search-button').addEventListener('click', () => this.handleSearch());
        document.getElementById('export-button').addEventListener('click', () => this.exportPlaylist());
    }

    async checkAuth() {
        const token = await this.auth.getValidToken();
        if (token) {
            this.showMainInterface();
            this.loadUserProfile();
        } else {
            this.showLoginInterface();
        }
    }

    showLoginInterface() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('main-container').style.display = 'none';
    }

    showMainInterface() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
    }

    async loadUserProfile() {
        try {
            const profile = await this.api.getUserProfile();
            document.getElementById('user-name').textContent = profile.display_name;
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showLoginInterface();
        }
    }

    async handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;

        try {
            const tracks = await this.api.searchTracks(query);
            this.displaySearchResults(tracks);
        } catch (error) {
            console.error('Error searching tracks:', error);
            alert('Error searching tracks. Please try again.');
        }
    }

    displaySearchResults(tracks) {
        const container = document.getElementById('search-results');
        container.innerHTML = '';

        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track-item';
            trackElement.innerHTML = `
                <div class="track-info">
                    <img src="${track.album.images[2]?.url || ''}" alt="${track.album.name}">
                    <div>
                        <h3>${track.name}</h3>
                        <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                    </div>
                </div>
                <button class="btn btn-secondary add-track" data-track='${JSON.stringify(track)}'>
                    Agregar
                </button>
            `;

            trackElement.querySelector('.add-track').addEventListener('click', () => {
                this.addTrackToPlaylist(track);
            });

            container.appendChild(trackElement);
        });
    }

    addTrackToPlaylist(track) {
        if (!this.playlist.some(t => t.id === track.id)) {
            this.playlist.push(track);
            this.updatePlaylistDisplay();
        }
    }

    removeTrackFromPlaylist(trackId) {
        this.playlist = this.playlist.filter(track => track.id !== trackId);
        this.updatePlaylistDisplay();
    }

    updatePlaylistDisplay() {
        const container = document.getElementById('playlist-tracks');
        container.innerHTML = '';

        this.playlist.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track-item';
            trackElement.innerHTML = `
                <div class="track-info">
                    <img src="${track.album.images[2]?.url || ''}" alt="${track.album.name}">
                    <div>
                        <h3>${track.name}</h3>
                        <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                    </div>
                </div>
                <button class="btn btn-danger remove-track" data-track-id="${track.id}">
                    Eliminar
                </button>
            `;

            trackElement.querySelector('.remove-track').addEventListener('click', () => {
                this.removeTrackFromPlaylist(track.id);
            });

            container.appendChild(trackElement);
        });
    }

    async exportPlaylist() {
        if (this.playlist.length === 0) {
            alert('La playlist está vacía');
            return;
        }

        try {
            const playlist = await this.api.createPlaylist('Mi Playlist', this.playlist);
            alert(`Playlist creada exitosamente: ${playlist.name}`);
            this.playlist = [];
            this.updatePlaylistDisplay();
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert('Error creating playlist. Please try again.');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 