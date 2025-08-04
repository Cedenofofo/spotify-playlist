class StatisticsManager {
    constructor() {
        this.auth = new Auth();
        this.currentTimeRange = 'short_term';
        this.shareStats = new ShareStatistics();
        this.isLoading = false;
        this.setupEventListeners();
        this.loadStatistics();
    }

    setupEventListeners() {
        const timeRangeSelect = document.getElementById('time-range-select');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.currentTimeRange = e.target.value;
                this.handleTimeRangeChange();
            });
        }

        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.handleCustomDateChange());
            endDateInput.addEventListener('change', () => this.handleCustomDateChange());
        }

        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        const shareButton = document.getElementById('share-stats-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.showShareOptions();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                this.hideShareModal();
            }
        });
    }

    handleTimeRangeChange() {
        const customDateRange = document.getElementById('custom-date-range');
        const timeRangeSelect = document.getElementById('time-range-select');
        
        if (this.currentTimeRange === 'custom_range') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
        
        this.loadStatistics();
    }

    handleCustomDateChange() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            this.loadStatistics();
        }
    }

    async loadStatistics() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading();
            
            const token = this.auth.getAccessToken();
            if (!token) {
                this.auth.logout();
                return;
            }

            const loadPromises = [
                this.loadTopArtists(),
                this.loadTopTracks(),
                this.loadUserProfile(),
                this.loadRecentlyPlayed()
            ];

            const [topArtists, topTracks, userProfile, recentlyPlayed] = await Promise.allSettled(loadPromises);

            const results = {
                topArtists: topArtists.status === 'fulfilled' ? topArtists.value : null,
                topTracks: topTracks.status === 'fulfilled' ? topTracks.value : null,
                userProfile: userProfile.status === 'fulfilled' ? userProfile.value : null,
                recentlyPlayed: recentlyPlayed.status === 'fulfilled' ? recentlyPlayed.value : null
            };

            this.displayStatistics(results);
            
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showError('Error al cargar las estadísticas');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadTopArtists() {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${this.currentTimeRange}&limit=20`, {
            headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
        });
        if (!response.ok) throw new Error('Failed to load top artists');
        return await response.json();
    }

    async loadTopTracks() {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${this.currentTimeRange}&limit=20`, {
            headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
        });
        if (!response.ok) throw new Error('Failed to load top tracks');
        return await response.json();
    }

    async loadUserProfile() {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
        });
        if (!response.ok) throw new Error('Failed to load user profile');
        return await response.json();
    }

    async loadRecentlyPlayed() {
        const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
            headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
        });
        if (!response.ok) throw new Error('Failed to load recently played');
        return await response.json();
    }

    displayStatistics(results) {
        if (results.topArtists) {
            this.displayTopArtists(results.topArtists.items);
        }
        
        if (results.topTracks) {
            this.displayTopTracks(results.topTracks.items);
        }
        
        if (results.userProfile && results.recentlyPlayed) {
            this.displayActivitySummary(results.userProfile, results.recentlyPlayed);
        }
        
        if (results.topArtists && results.topTracks) {
            this.displayGenreAnalysis(results.topArtists.items, results.topTracks.items);
            this.displayMoodAnalysis(results.topTracks.items);
            this.displayUniquenessScore(results.topArtists.items, results.topTracks.items);
        }
    }

    displayTopArtists(artists) {
        const container = document.getElementById('top-artists');
        if (!container || !artists) return;
        
        container.innerHTML = '';
        
        artists.forEach((artist, index) => {
            const artistCard = document.createElement('div');
            artistCard.className = 'artist-card';
            artistCard.innerHTML = `
                <div class="artist-rank">#${index + 1}</div>
                <img src="${artist.images[0]?.url || 'img/placeholder-artist.jpg'}" alt="${artist.name}" class="artist-image">
                <div class="artist-info">
                    <h3 class="artist-name">${this.escapeHtml(artist.name)}</h3>
                    <p class="artist-genre">${artist.genres[0] || 'Género desconocido'}</p>
                    <div class="artist-popularity">
                        <div class="popularity-bar">
                            <div class="popularity-fill" style="width: ${artist.popularity}%"></div>
                        </div>
                        <span class="popularity-text">${artist.popularity}% popularidad</span>
                    </div>
                </div>
                <button class="artist-details-btn" onclick="statisticsManager.showArtistDetails('${artist.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            `;
            container.appendChild(artistCard);
        });
    }

    displayTopTracks(tracks) {
        const container = document.getElementById('top-tracks');
        if (!container || !tracks) return;
        
        container.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            trackCard.innerHTML = `
                <div class="track-rank">#${index + 1}</div>
                <img src="${track.album.images[0]?.url || 'img/placeholder-track.jpg'}" alt="${track.name}" class="track-image">
                <div class="track-info">
                    <h3 class="track-name">${this.escapeHtml(track.name)}</h3>
                    <p class="track-artist">${track.artists.map(a => this.escapeHtml(a.name)).join(', ')}</p>
                    <p class="track-album">${this.escapeHtml(track.album.name)}</p>
                    <div class="track-duration">${this.formatDuration(track.duration_ms)}</div>
                </div>
                <button class="track-preview-btn" onclick="statisticsManager.playTrackPreview('${track.id}')">
                    <i class="fas fa-play"></i>
                </button>
            `;
            container.appendChild(trackCard);
        });
    }

    displayActivitySummary(profile, recentlyPlayed) {
        const container = document.getElementById('activity-summary');
        if (!container) return;
        
        const totalTracks = recentlyPlayed.items.length;
        const uniqueArtists = new Set(recentlyPlayed.items.map(item => item.track.artists[0].id)).size;
        const totalDuration = recentlyPlayed.items.reduce((sum, item) => sum + item.track.duration_ms, 0);
        
        container.innerHTML = `
            <div class="summary-card">
                <div class="summary-icon">🎵</div>
                <div class="summary-content">
                    <h3>${profile.display_name}</h3>
                    <p>${totalTracks} canciones escuchadas</p>
                    <p>${uniqueArtists} artistas únicos</p>
                    <p>${this.formatDuration(totalDuration)} de música</p>
                </div>
            </div>
        `;
        
        this.displayListeningTime(recentlyPlayed);
    }

    displayListeningTime(recentlyPlayed) {
        const container = document.getElementById('listening-time');
        if (!container) return;
        
        const now = Date.now();
        const timeRanges = {
            '24h': { label: 'Últimas 24 horas', hours: 24 },
            '7d': { label: 'Últimos 7 días', hours: 168 },
            '30d': { label: 'Últimos 30 días', hours: 720 }
        };
        
        let listeningStats = '';
        
        Object.entries(timeRanges).forEach(([key, range]) => {
            const cutoffTime = now - (range.hours * 60 * 60 * 1000);
            const tracksInRange = recentlyPlayed.items.filter(item => 
                new Date(item.played_at).getTime() > cutoffTime
            );
            
            const duration = tracksInRange.reduce((sum, item) => sum + item.track.duration_ms, 0);
            const hours = Math.floor(duration / 3600000);
            const minutes = Math.floor((duration % 3600000) / 60000);
            
            listeningStats += `
                <div class="time-range-card">
                    <h4>${range.label}</h4>
                    <div class="time-stats">
                        <span class="time-value">${hours}h ${minutes}m</span>
                        <span class="track-count">${tracksInRange.length} canciones</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = listeningStats;
    }

    displayGenreAnalysis(artists, tracks) {
        const container = document.getElementById('genre-analysis');
        if (!container) return;
        
        const genreCount = {};
        artists.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        
        const topGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([genre, count]) => ({ name: genre, count }));
        
        let genreHTML = '';
        topGenres.forEach((genre, index) => {
            const percentage = Math.round((genre.count / artists.length) * 100);
            genreHTML += `
                <div class="genre-item">
                    <div class="genre-rank">#${index + 1}</div>
                    <div class="genre-info">
                        <h4>${this.capitalizeFirst(genre.name)}</h4>
                        <p>${genre.count} artistas</p>
                    </div>
                    <div class="genre-bar">
                        <div class="genre-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="genre-percentage">${percentage}%</span>
                </div>
            `;
        });
        
        container.innerHTML = genreHTML;
    }

    displayMoodAnalysis(tracks) {
        const container = document.getElementById('mood-analysis');
        if (!container) return;
        
        const moodCount = {};
        tracks.forEach(track => {
            if (track.audio_features) {
                const energy = track.audio_features.energy;
                const valence = track.audio_features.valence;
                
                let mood = 'Neutral';
                if (energy > 0.7 && valence > 0.6) mood = 'Energético';
                else if (energy > 0.7 && valence < 0.4) mood = 'Intenso';
                else if (energy < 0.3 && valence > 0.6) mood = 'Relajado';
                else if (energy < 0.3 && valence < 0.4) mood = 'Melancólico';
                else if (valence > 0.6) mood = 'Feliz';
                else mood = 'Neutral';
                
                moodCount[mood] = (moodCount[mood] || 0) + 1;
            }
        });
        
        const topMoods = Object.entries(moodCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        let moodHTML = '';
        topMoods.forEach(([mood, count], index) => {
            const percentage = Math.round((count / tracks.length) * 100);
            moodHTML += `
                <div class="mood-item">
                    <div class="mood-rank">#${index + 1}</div>
                    <div class="mood-info">
                        <h4>${mood}</h4>
                        <p>${count} canciones</p>
                    </div>
                    <div class="mood-bar">
                        <div class="mood-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="mood-percentage">${percentage}%</span>
                </div>
            `;
        });
        
        container.innerHTML = moodHTML;
    }

    displayUniquenessScore(artists, tracks) {
        const container = document.getElementById('uniqueness-score');
        if (!container) return;
        
        const uniqueArtists = new Set(artists.map(a => a.id)).size;
        const uniqueGenres = new Set(artists.flatMap(a => a.genres)).size;
        const diversityScore = Math.round((uniqueArtists / artists.length) * 100);
        
        const uniquenessLevel = this.getUniquenessLevel(diversityScore);
        
        container.innerHTML = `
            <div class="uniqueness-card">
                <div class="uniqueness-icon">🎯</div>
                <div class="uniqueness-content">
                    <h3>Puntuación de Diversidad</h3>
                    <div class="uniqueness-score">${diversityScore}%</div>
                    <p class="uniqueness-level">${uniquenessLevel}</p>
                    <div class="uniqueness-stats">
                        <span>${uniqueArtists} artistas únicos</span>
                        <span>${uniqueGenres} géneros diferentes</span>
                    </div>
                </div>
            </div>
        `;
    }

    getUniquenessLevel(score) {
        if (score >= 80) return '🎭 Muy Diverso';
        if (score >= 60) return '🎨 Diverso';
        if (score >= 40) return '🎵 Moderado';
        if (score >= 20) return '🎤 Específico';
        return '🎧 Muy Específico';
    }

    getTimeRangeLabel() {
        const labels = {
            'short_term': 'Últimas 4 semanas',
            'medium_term': 'Últimos 6 meses',
            'long_term': 'Todo el tiempo'
        };
        return labels[this.currentTimeRange] || 'Últimas 4 semanas';
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Hace menos de 1 hora';
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} días`;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    async showArtistDetails(artistId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
            });
            const artist = await response.json();
            alert(`Detalles de ${artist.name}\nSeguidores: ${artist.followers.total.toLocaleString()}\nGéneros: ${artist.genres.join(', ')}`);
        } catch (error) {
            console.error('Error loading artist details:', error);
        }
    }

    async playTrackPreview(trackId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
            });
            const track = await response.json();
            if (track.preview_url) {
                const audio = new Audio(track.preview_url);
                audio.play();
            } else {
                alert('No hay vista previa disponible para esta canción');
            }
        } catch (error) {
            console.error('Error playing track preview:', error);
        }
    }

    async showShareOptions() {
        try {
            this.showLoading();
            
            const statsData = await this.collectStatsData();
            const imageDataUrl = await this.shareStats.generateStoryImage(statsData);
            
            this.showShareModal(imageDataUrl);
            
        } catch (error) {
            console.error('Error generating share image:', error);
            this.showError('Error al generar la imagen para compartir');
        } finally {
            this.hideLoading();
        }
    }

    async collectStatsData() {
        const token = this.auth.getAccessToken();
        if (!token) throw new Error('No access token');
        
        const [topArtists, topTracks, userProfile, recentlyPlayed] = await Promise.all([
            fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${this.currentTimeRange}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${this.currentTimeRange}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json())
        ]);
        
        const uniqueArtists = new Set(recentlyPlayed.items.map(item => item.track.artists[0].id)).size;
        const totalDuration = recentlyPlayed.items.reduce((sum, item) => sum + item.track.duration_ms, 0);
        
        const genreCount = {};
        topArtists.items.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        
        const topGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        
        const moodCount = {};
        topTracks.items.forEach(track => {
            if (track.audio_features) {
                const energy = track.audio_features.energy;
                const valence = track.audio_features.valence;
                
                let mood = 'Neutral';
                if (energy > 0.7 && valence > 0.6) mood = 'Energético';
                else if (energy > 0.7 && valence < 0.4) mood = 'Intenso';
                else if (energy < 0.3 && valence > 0.6) mood = 'Relajado';
                else if (energy < 0.3 && valence < 0.4) mood = 'Melancólico';
                else if (valence > 0.6) mood = 'Feliz';
                else mood = 'Neutral';
                
                moodCount[mood] = (moodCount[mood] || 0) + 1;
            }
        });
        
        const topMoods = Object.entries(moodCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        
        return {
            timeRange: this.currentTimeRange,
            totalTracks: recentlyPlayed.items.length,
            totalArtists: uniqueArtists,
            totalDuration: totalDuration,
            totalGenres: Object.keys(genreCount).length,
            topArtists: topArtists.items,
            topTracks: topTracks.items,
            topGenres: topGenres,
            topMoods: topMoods,
            userProfile: userProfile,
            avgPopularity: Math.round(topTracks.items.reduce((sum, track) => sum + track.popularity, 0) / topTracks.items.length),
            diversityScore: Math.round((uniqueArtists / topArtists.items.length) * 100),
            avgEnergy: Math.round(topTracks.items.reduce((sum, track) => sum + (track.audio_features?.energy || 0), 0) / topTracks.items.length * 100)
        };
    }

    showShareModal(imageDataUrl) {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.setupShareButtons(imageDataUrl);
        }
    }

    hideShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setupShareButtons(imageDataUrl) {
        const downloadButton = document.querySelector('.download-share');
        
        if (downloadButton) {
            downloadButton.onclick = (e) => {
                e.preventDefault();
                this.shareStats.shareToSocialMedia(imageDataUrl, 'download');
            };
        }
        
        const closeButton = document.querySelector('.close-modal');
        if (closeButton) {
            closeButton.onclick = () => this.hideShareModal();
        }
    }

    showNotification(message, type = 'success') {
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
}

window.StatisticsManager = StatisticsManager; 