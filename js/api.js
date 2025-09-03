class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
    }

    async searchTracks(query) {
        const token = await this.auth.getValidToken();
        if (!token) throw new Error('No valid token');

        const response = await fetch(`${config.apiUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to search tracks');
        }

        const data = await response.json();
        return data.tracks.items;
    }

    async createPlaylist(name, tracks) {
        const token = await this.auth.getValidToken();
        if (!token) throw new Error('No valid token');

        // Get user profile
        const userResponse = await fetch(`${config.apiUrl}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to get user profile');
        }

        const userData = await userResponse.json();

        // Create playlist
        const playlistResponse = await fetch(`${config.apiUrl}/users/${userData.id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                public: true
            })
        });

        if (!playlistResponse.ok) {
            throw new Error('Failed to create playlist');
        }

        const playlist = await playlistResponse.json();

        // Add tracks to playlist
        const uris = tracks.map(track => track.uri);
        const addTracksResponse = await fetch(`${config.apiUrl}/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: uris
            })
        });

        if (!addTracksResponse.ok) {
            throw new Error('Failed to add tracks to playlist');
        }

        return playlist;
    }

    async getUserProfile() {
        const token = await this.auth.getValidToken();
        if (!token) throw new Error('No valid token');

        const response = await fetch(`${config.apiUrl}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user profile');
        }

        return await response.json();
    }
} 