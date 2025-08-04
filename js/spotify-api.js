class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
    }

    async getValidToken() {
        const token = this.auth.getAccessToken();
        if (!token) {
            return null;
        }

        const tokenExpires = localStorage.getItem('spotify_token_expires');
        if (tokenExpires && Date.now() > parseInt(tokenExpires)) {
            return await this.refreshToken();
        }

        return token;
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (!refreshToken) {
            this.auth.logout();
            return null;
        }

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(window.config.clientId + ':' + window.config.clientSecret)
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            
            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));
            
            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }

            return data.access_token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.auth.logout();
            return null;
        }
    }

    async makeRequest(url, options = {}) {
        const token = await this.getValidToken();
        if (!token) {
            throw new Error('No valid token available');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            if (response.status === 401) {
                const newToken = await this.refreshToken();
                if (newToken) {
                    finalOptions.headers.Authorization = `Bearer ${newToken}`;
                    const retryResponse = await fetch(url, finalOptions);
                    if (!retryResponse.ok) {
                        throw new Error(`API request failed: ${retryResponse.status}`);
                    }
                    return await retryResponse.json();
                }
            }
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    }

    async getUserProfile() {
        return await this.makeRequest('https://api.spotify.com/v1/me');
    }

    async getTopArtists(timeRange = 'short_term', limit = 20) {
        return await this.makeRequest(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`);
    }

    async getTopTracks(timeRange = 'short_term', limit = 20) {
        return await this.makeRequest(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
    }

    async getRecentlyPlayed(limit = 50) {
        return await this.makeRequest(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`);
    }

    async getArtistDetails(artistId) {
        return await this.makeRequest(`https://api.spotify.com/v1/artists/${artistId}`);
    }

    async getTrackDetails(trackId) {
        return await this.makeRequest(`https://api.spotify.com/v1/tracks/${trackId}`);
    }

    async searchTracks(query, limit = 20) {
        return await this.makeRequest(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
    }

    async searchArtists(query, limit = 20) {
        return await this.makeRequest(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`);
    }

    async getPlaylists(limit = 20) {
        return await this.makeRequest(`https://api.spotify.com/v1/me/playlists?limit=${limit}`);
    }

    async getPlaylistTracks(playlistId, limit = 100) {
        return await this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`);
    }

    async createPlaylist(name, description = '', isPublic = true) {
        const userProfile = await this.getUserProfile();
        
        return await this.makeRequest(`https://api.spotify.com/v1/users/${userProfile.id}/playlists`, {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                description: description,
                public: isPublic
            })
        });
    }

    async addTracksToPlaylist(playlistId, trackUris) {
        return await this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            body: JSON.stringify({
                uris: trackUris
            })
        });
    }

    async removeTracksFromPlaylist(playlistId, trackUris) {
        return await this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'DELETE',
            body: JSON.stringify({
                tracks: trackUris.map(uri => ({ uri: uri }))
            })
        });
    }

    async updatePlaylistDetails(playlistId, name, description = '') {
        return await this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: name,
                description: description
            })
        });
    }
}

window.SpotifyAPI = SpotifyAPI; 