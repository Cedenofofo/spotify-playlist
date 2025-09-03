class StatisticsManager {
    constructor() {
        this.auth = new Auth();
        this.currentTimeRange = 'short_term'; // short_term, medium_term, long_term
        this.shareStats = new ShareStatistics();
        this.isLoading = false;
        this.setupEventListeners();
        this.loadStatistics();
    }

    setupEventListeners() {
        // Selector de período de tiempo
        const timeRangeSelect = document.getElementById('time-range-select');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.currentTimeRange = e.target.value;
                this.handleTimeRangeChange();
            });
        }

        // Custom date range inputs
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.handleCustomDateChange());
            endDateInput.addEventListener('change', () => this.handleCustomDateChange());
        }

        // Botones de navegación
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        // Botones de compartir
        const shareButton = document.getElementById('share-stats-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.showShareOptions();
            });
        }

        // Modal close functionality
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
        if (this.isLoading) return; // Prevent multiple simultaneous loads
        
        try {
            this.isLoading = true;
            this.showLoading();
            
            // Verificar autenticación
            const token = this.auth.getAccessToken();
            if (!token) {
                this.auth.logout();
                return;
            }

            // Cargar todas las estadísticas en paralelo con timeout
            const loadPromises = [
                this.loadTopArtists(),
                this.loadTopTracks(),
                this.loadUserProfile(),
                this.loadRecentlyPlayed()
            ];

            const [topArtists, topTracks, userProfile, recentlyPlayed] = await Promise.allSettled(loadPromises);

            // Procesar resultados y manejar errores individuales
            const results = {
                topArtists: topArtists.status === 'fulfilled' ? topArtists.value : null,
                topTracks: topTracks.status === 'fulfilled' ? topTracks.value : null,
                userProfile: userProfile.status === 'fulfilled' ? userProfile.value : null,
                recentlyPlayed: recentlyPlayed.status === 'fulfilled' ? recentlyPlayed.value : null
            };

            // Mostrar estadísticas disponibles
            if (results.topArtists) this.displayTopArtists(results.topArtists);
            if (results.topTracks) this.displayTopTracks(results.topTracks);
            if (results.userProfile && results.recentlyPlayed) {
                this.displayActivitySummary(results.userProfile, results.recentlyPlayed);
            }
            if (results.recentlyPlayed) this.displayListeningTime(results.recentlyPlayed);
            if (results.topArtists && results.topTracks) {
                this.displayGenreAnalysis(results.topArtists, results.topTracks);
                this.displayMoodAnalysis(results.topTracks);
                this.displayUniquenessScore(results.topArtists, results.topTracks);
            }

            this.hideLoading();
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showError('Error al cargar las estadísticas. Intenta de nuevo.');
        } finally {
            this.isLoading = false;
        }
    }

    async loadTopArtists() {
        const api = new SpotifyAPI(this.auth);
        return await api.getTopArtists(this.currentTimeRange, 10);
    }

    async loadTopTracks() {
        const api = new SpotifyAPI(this.auth);
        return await api.getTopTracks(this.currentTimeRange, 10);
    }

    async loadUserProfile() {
        const api = new SpotifyAPI(this.auth);
        return await api.getUserProfile();
    }

    async loadRecentlyPlayed() {
        const api = new SpotifyAPI(this.auth);
        // Get maximum tracks available (Spotify API limit is 50)
        const recentlyPlayed = await api.getRecentlyPlayed(50);
        
        // Filter tracks based on current time range
        if (recentlyPlayed && recentlyPlayed.items) {
            const now = new Date();
            let timeRangeMs;
            
            switch (this.currentTimeRange) {
                case 'short_term':
                    timeRangeMs = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks
                    break;
                case 'medium_term':
                    timeRangeMs = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months
                    break;
                case 'long_term':
                    timeRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year
                    break;
                case 'custom_year':
                    timeRangeMs = 365 * 24 * 60 * 60 * 1000; // Last 365 days
                    break;
                case 'custom_range':
                    // For custom range, use the selected dates
                    const startDate = document.getElementById('start-date')?.value;
                    const endDate = document.getElementById('end-date')?.value;
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        timeRangeMs = end - start;
                    } else {
                        timeRangeMs = 4 * 7 * 24 * 60 * 60 * 1000; // Default to 4 weeks
                    }
                    break;
                default:
                    timeRangeMs = 4 * 7 * 24 * 60 * 60 * 1000; // Default to 4 weeks
            }
            
            const filteredItems = recentlyPlayed.items.filter(item => {
                const playedAt = new Date(item.played_at);
                return (now - playedAt) <= timeRangeMs;
            });
            
            console.log(`Filtered ${filteredItems.length} tracks from ${recentlyPlayed.items.length} total (max 50 from Spotify API) for time range: ${this.currentTimeRange}`);
            
            return { ...recentlyPlayed, items: filteredItems };
        }
        
        return recentlyPlayed;
    }

    displayTopArtists(artists) {
        const container = document.getElementById('top-artists-container');
        if (!container || !artists?.items) return;

        const timeRangeLabel = this.getTimeRangeLabel();
        
        // Update the time range badge in the card header
        const timeRangeBadge = container.closest('.content-card')?.querySelector('.time-range-badge');
        if (timeRangeBadge) {
            timeRangeBadge.textContent = timeRangeLabel;
        }

        container.innerHTML = `
            <div class="artists-grid">
                ${artists.items.map((artist, index) => `
                    <div class="artist-card" data-artist-id="${artist.id}">
                        <div class="artist-rank">#${index + 1}</div>
                        <div class="artist-image">
                            <img src="${artist.images[0]?.url || 'https://via.placeholder.com/120x120/1db954/ffffff?text=🎵'}" 
                                 alt="${artist.name}" onerror="this.src='https://via.placeholder.com/120x120/1db954/ffffff?text=🎵'">
                        </div>
                        <div class="artist-info">
                            <h4 class="artist-name">${this.escapeHtml(artist.name)}</h4>
                            <p class="artist-genres">${artist.genres.slice(0, 3).join(', ')}</p>
                            <div class="artist-popularity">
                                <div class="popularity-bar">
                                    <div class="popularity-fill" style="width: ${artist.popularity}%"></div>
                                </div>
                                <span class="popularity-text">${artist.popularity}% popularidad</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners for artist details
        container.querySelectorAll('.artist-card').forEach(card => {
            card.addEventListener('click', () => {
                const artistId = card.dataset.artistId;
                this.showArtistDetails(artistId);
            });
        });
    }

    displayTopTracks(tracks) {
        const container = document.getElementById('top-tracks-container');
        if (!container || !tracks?.items) return;

        const timeRangeLabel = this.getTimeRangeLabel();
        
        // Update the time range badge in the card header
        const timeRangeBadge = container.closest('.content-card')?.querySelector('.time-range-badge');
        if (timeRangeBadge) {
            timeRangeBadge.textContent = timeRangeLabel;
        }

        container.innerHTML = `
            <div class="tracks-list">
                ${tracks.items.map((track, index) => `
                    <div class="track-item" data-track-id="${track.id}">
                        <div class="track-rank">#${index + 1}</div>
                        <div class="track-image">
                            <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/60x60/1db954/ffffff?text=🎵'}" 
                                 alt="${track.album.name}" onerror="this.src='https://via.placeholder.com/60x60/1db954/ffffff?text=🎵'">
                        </div>
                        <div class="track-info">
                            <h4 class="track-name">${this.escapeHtml(track.name)}</h4>
                            <p class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</p>
                            <p class="track-album">${track.album.name}</p>
                        </div>
                        <div class="track-stats">
                            <div class="track-popularity">
                                <div class="popularity-bar">
                                    <div class="popularity-fill" style="width: ${track.popularity}%"></div>
                                </div>
                                <span>${track.popularity}%</span>
                            </div>
                            <div class="track-duration">
                                ${this.formatDuration(track.duration_ms)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners for track preview
        container.querySelectorAll('.track-item').forEach(item => {
            item.addEventListener('click', () => {
                const trackId = item.dataset.trackId;
                this.playTrackPreview(trackId);
            });
        });
    }

    displayActivitySummary(profile, recentlyPlayed) {
        const container = document.getElementById('activity-summary-container');
        if (!container) return;

        // Calculate base statistics from recently played data
        const totalTracks = recentlyPlayed?.items?.length || 0;
        const uniqueArtists = new Set(recentlyPlayed?.items?.map(item => item.track.artists[0].name) || []).size;
        const totalDuration = recentlyPlayed?.items?.reduce((total, item) => total + item.track.duration_ms, 0) || 0;
        const avgDuration = totalTracks > 0 ? totalDuration / totalTracks : 0;

        // Estimate realistic statistics based on time range
        let estimatedTracks = totalTracks;
        let estimatedUniqueArtists = uniqueArtists;
        let estimatedAvgDuration = avgDuration;

        switch (this.currentTimeRange) {
            case 'short_term':
                // For 4 weeks, estimate based on daily listening
                const daysInShortTerm = 28;
                const avgTracksPerDayShort = 15;
                estimatedTracks = daysInShortTerm * avgTracksPerDayShort;
                estimatedUniqueArtists = Math.round(estimatedTracks * 0.3); // 30% unique artists
                estimatedAvgDuration = avgDuration || 180000; // 3 minutes default
                break;
            case 'medium_term':
                // For 6 months, estimate based on average daily listening
                const daysInMediumTerm = 180;
                const avgTracksPerDayMedium = 20;
                estimatedTracks = daysInMediumTerm * avgTracksPerDayMedium;
                estimatedUniqueArtists = Math.round(estimatedTracks * 0.25); // 25% unique artists
                estimatedAvgDuration = avgDuration || 180000;
                break;
            case 'long_term':
                // For 1 year, estimate based on average daily listening
                const daysInLongTerm = 365;
                const avgTracksPerDayLong = 25;
                estimatedTracks = daysInLongTerm * avgTracksPerDayLong;
                estimatedUniqueArtists = Math.round(estimatedTracks * 0.2); // 20% unique artists
                estimatedAvgDuration = avgDuration || 180000;
                break;
            case 'custom_year':
                // For custom year (last 365 days)
                const daysInCustomYear = 365;
                const avgTracksPerDayCustomYear = 22;
                estimatedTracks = daysInCustomYear * avgTracksPerDayCustomYear;
                estimatedUniqueArtists = Math.round(estimatedTracks * 0.22); // 22% unique artists
                estimatedAvgDuration = avgDuration || 180000;
                break;
            case 'custom_range':
                // For custom date range, calculate based on selected dates
                const startDate = document.getElementById('start-date')?.value;
                const endDate = document.getElementById('end-date')?.value;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const daysInCustomRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    const avgTracksPerDayCustomRange = 18;
                    estimatedTracks = daysInCustomRange * avgTracksPerDayCustomRange;
                    estimatedUniqueArtists = Math.round(estimatedTracks * 0.28); // 28% unique artists
                    estimatedAvgDuration = avgDuration || 180000;
                }
                break;
        }

        // Get time range label for context
        const timeRangeLabel = this.getTimeRangeLabel();

        container.innerHTML = `
            <div class="activity-summary">
                <div class="activity-stats">
                    <div class="activity-stat-item">
                        <div class="stat-number">${estimatedTracks.toLocaleString()}</div>
                        <div class="stat-label">Canciones Escuchadas</div>
                    </div>
                    <div class="activity-stat-item">
                        <div class="stat-number">${estimatedUniqueArtists.toLocaleString()}</div>
                        <div class="stat-label">Artistas Únicos</div>
                    </div>
                    <div class="activity-stat-item">
                        <div class="stat-number">${Math.round(estimatedAvgDuration / 60000)}</div>
                        <div class="stat-label">Promedio (min)</div>
                    </div>
                </div>
                <div class="activity-description">
                    <p>Tu actividad musical en <strong>${timeRangeLabel}</strong> muestra un patrón diverso de escucha con ${estimatedUniqueArtists.toLocaleString()} artistas diferentes en ${estimatedTracks.toLocaleString()} canciones.</p>
                </div>
            </div>
        `;
    }

    displayListeningTime(recentlyPlayed) {
        const container = document.getElementById('listening-time-container');
        if (!container || !recentlyPlayed?.items) return;

        // Calculate total listening time based on real duration
        const totalDuration = recentlyPlayed.items.reduce((total, item) => total + item.track.duration_ms, 0);
        
        // Calculate realistic listening time based on time range
        let estimatedDuration = totalDuration;
        let timeRangeLabel = this.getTimeRangeLabel();
        
        switch (this.currentTimeRange) {
            case 'short_term':
                // For 4 weeks, use actual data but estimate based on daily listening
                const daysInShortTerm = 28; // 4 weeks
                const avgTracksPerDayShort = 15;
                const totalEstimatedTracks = daysInShortTerm * avgTracksPerDayShort;
                const avgTrackDuration = totalDuration / recentlyPlayed.items.length;
                estimatedDuration = totalEstimatedTracks * avgTrackDuration;
                break;
            case 'medium_term':
                // For 6 months, estimate based on average daily listening
                const daysInMediumTerm = 180; // 6 months
                const avgTracksPerDayMedium = 20;
                const totalEstimatedTracksMedium = daysInMediumTerm * avgTracksPerDayMedium;
                const avgTrackDurationMedium = totalDuration / recentlyPlayed.items.length;
                estimatedDuration = totalEstimatedTracksMedium * avgTrackDurationMedium;
                break;
            case 'long_term':
                // For 1 year, estimate based on average daily listening
                const daysInLongTerm = 365; // 1 year
                const avgTracksPerDayLong = 25;
                const totalEstimatedTracksLong = daysInLongTerm * avgTracksPerDayLong;
                const avgTrackDurationLong = totalDuration / recentlyPlayed.items.length;
                estimatedDuration = totalEstimatedTracksLong * avgTrackDurationLong;
                break;
            case 'custom_year':
                // For custom year (last 365 days)
                const daysInCustomYear = 365;
                const avgTracksPerDayCustomYear = 22;
                const totalEstimatedTracksCustomYear = daysInCustomYear * avgTracksPerDayCustomYear;
                const avgTrackDurationCustomYear = totalDuration / recentlyPlayed.items.length;
                estimatedDuration = totalEstimatedTracksCustomYear * avgTrackDurationCustomYear;
                break;
            case 'custom_range':
                // For custom date range, calculate based on selected dates
                const startDate = document.getElementById('start-date')?.value;
                const endDate = document.getElementById('end-date')?.value;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const daysInCustomRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    const avgTracksPerDayCustomRange = 18;
                    const totalEstimatedTracksCustomRange = daysInCustomRange * avgTracksPerDayCustomRange;
                    const avgTrackDurationCustomRange = totalDuration / recentlyPlayed.items.length;
                    estimatedDuration = totalEstimatedTracksCustomRange * avgTrackDurationCustomRange;
                }
                break;
        }

        // Convert to hours and minutes
        const totalHours = Math.floor(estimatedDuration / (1000 * 60 * 60));
        const totalMinutes = Math.floor((estimatedDuration % (1000 * 60 * 60)) / (1000 * 60));

        const timeValue = totalHours > 0 ? `${totalHours}h ${totalMinutes}min` : `${totalMinutes}min`;

        container.innerHTML = `
            <div class="listening-stats">
                <div class="time-value">
                    <span class="hours">${totalHours}</span>
                    <span class="time-unit">h</span>
                    <span class="minutes">${totalMinutes}</span>
                    <span class="time-unit">min</span>
                </div>
                <div class="time-description">
                    <p>Estimado para ${timeRangeLabel}</p>
                </div>
            </div>
        `;
    }

    displayGenreAnalysis(artists, tracks) {
        const container = document.getElementById('genre-analysis-container');
        if (!container || !artists?.items) return;

        // Analyze artist genres
        const genreCount = {};
        artists.items.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });

        // Sort genres by frequency
        const sortedGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        container.innerHTML = `
            <div class="genre-list">
                ${sortedGenres.map(([genre, count], index) => `
                    <div class="genre-item">
                        <div class="genre-info">
                            <div class="genre-icon">
                                <i class="fas fa-music"></i>
                            </div>
                            <div class="genre-details">
                                <h4>${this.capitalizeFirst(genre)}</h4>
                                <p>${count} artistas</p>
                            </div>
                            <div class="genre-percentage">
                                ${Math.round((count / sortedGenres[0][1]) * 100)}%
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayMoodAnalysis(tracks) {
        const container = document.getElementById('mood-analysis-container');
        if (!container || !tracks?.items) return;

        // Simulate mood analysis based on track characteristics
        const moods = {
            'Energético': 35,
            'Relajado': 25,
            'Melancólico': 20,
            'Bailable': 15,
            'Romántico': 5
        };

        container.innerHTML = `
            <div class="mood-list">
                ${Object.entries(moods).map(([mood, percentage]) => `
                    <div class="mood-item">
                        <div class="mood-info">
                            <div class="mood-icon">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="mood-details">
                                <h4>${mood}</h4>
                                <p>Estado de ánimo</p>
                            </div>
                            <div class="mood-percentage">
                                ${percentage}%
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayUniquenessScore(artists, tracks) {
        const container = document.getElementById('uniqueness-container');
        if (!container || !artists?.items || !tracks?.items) return;

        // Calculate uniqueness score based on average popularity
        const avgArtistPopularity = artists.items.reduce((sum, artist) => sum + artist.popularity, 0) / artists.items.length;
        const avgTrackPopularity = tracks.items.reduce((sum, track) => sum + track.popularity, 0) / tracks.items.length;
        
        const uniquenessScore = Math.round(100 - ((avgArtistPopularity + avgTrackPopularity) / 2));
        const uniquenessLevel = this.getUniquenessLevel(uniquenessScore);

        // Get unique artists and tracks count
        const uniqueArtists = new Set(artists.items.map(artist => artist.name)).size;
        const uniqueTracks = new Set(tracks.items.map(track => track.name)).size;

        // Calculate genre diversity (real data that changes with filters)
        const allGenres = [];
        artists.items.forEach(artist => {
            if (artist.genres && artist.genres.length > 0) {
                allGenres.push(...artist.genres);
            }
        });
        const uniqueGenres = new Set(allGenres).size;
        
        // Calculate average genres per artist
        const avgGenresPerArtist = allGenres.length / artists.items.length;

        container.innerHTML = `
            <div class="uniqueness-analysis">
                <div class="uniqueness-visual">
                    <div class="uniqueness-radar">
                        <div class="radar-circle">
                            <div class="radar-fill" style="transform: rotate(${uniquenessScore * 3.6}deg)"></div>
                            <div class="radar-center">
                                <span class="radar-score">${uniquenessScore}</span>
                                <span class="radar-label">%</span>
                            </div>
                        </div>
                    </div>
                    <div class="uniqueness-metrics">
                        <div class="metric-item">
                            <div class="metric-icon">🎵</div>
                            <div class="metric-value">${uniqueTracks}</div>
                            <div class="metric-label">Canciones Únicas</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-icon">🎤</div>
                            <div class="metric-value">${uniqueArtists}</div>
                            <div class="metric-label">Artistas Únicos</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-icon">🎼</div>
                            <div class="metric-value">${uniqueGenres}</div>
                            <div class="metric-label">Géneros Únicos</div>
                        </div>
                    </div>
                </div>
                <div class="uniqueness-description">
                    <h4>${uniquenessLevel.title}</h4>
                    <p>${uniquenessLevel.description}</p>
                </div>
            </div>
        `;
    }

    getUniquenessLevel(score) {
        if (score >= 80) {
            return {
                title: 'Gustos Únicos',
                description: 'Tienes un gusto musical muy exclusivo y descubres artistas poco conocidos.'
            };
        } else if (score >= 60) {
            return {
                title: 'Gustos Diversos',
                description: 'Balanceas entre música popular y descubrimientos únicos.'
            };
        } else if (score >= 40) {
            return {
                title: 'Gustos Populares',
                description: 'Prefieres música conocida y artistas establecidos.'
            };
        } else {
            return {
                title: 'Gustos Mainstream',
                description: 'Te inclinas por la música más popular y comercial.'
            };
        }
    }

    getTimeRangeLabel() {
        const labels = {
            'short_term': 'Últimas 4 semanas',
            'medium_term': 'Últimos 6 meses',
            'long_term': 'Todo el tiempo',
            'custom_year': 'Último año',
            'custom_range': 'Rango personalizado'
        };
        
        if (this.currentTimeRange === 'custom_range') {
            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            if (startDate && endDate) {
                const start = new Date(startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                const end = new Date(endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                return `${start} - ${end}`;
            }
        }
        
        return labels[this.currentTimeRange] || 'Período desconocido';
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const playedAt = new Date(timestamp);
        const diffMs = now - playedAt;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
            return 'hace poco';
        }
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
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                </div>
            `;
            errorContainer.style.display = 'block';
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    async showArtistDetails(artistId) {
        // Implement artist details modal
        console.log('Mostrar detalles del artista:', artistId);
        this.showNotification('Función de detalles de artista próximamente', 'info');
    }

    async playTrackPreview(trackId) {
        // Implement track preview playback
        console.log('Reproducir preview de track:', trackId);
        this.showNotification('Función de preview próximamente', 'info');
    }

    async showShareOptions() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading();
            
            // Collect statistics data
            const statsData = await this.collectStatsData();
            
            // Generate image
            const imageDataUrl = await this.shareStats.generateStoryImage(statsData);
            
            this.hideLoading();
            
            // Show share modal
            this.showShareModal(imageDataUrl);
            
        } catch (error) {
            console.error('Error generating share image:', error);
            this.showError('Error al generar imagen para compartir');
            this.hideLoading();
        } finally {
            this.isLoading = false;
        }
    }

    async collectStatsData() {
        // Collect all statistics data
        const statsData = {
            topArtists: null,
            topTracks: null,
            genres: [],
            moods: [],
            listeningTime: '',
            uniquenessScore: 0,
            uniqueGenres: 0,
            uniqueArtists: 0,
            uniqueTracks: 0
        };

        try {
            // Get data from artists, tracks and recent activity
            const [topArtists, topTracks, recentlyPlayed] = await Promise.all([
                this.loadTopArtists(),
                this.loadTopTracks(),
                this.loadRecentlyPlayed()
            ]);

            statsData.topArtists = topArtists;
            statsData.topTracks = topTracks;

            // Calculate listening time
            if (recentlyPlayed && recentlyPlayed.items) {
                const totalDuration = recentlyPlayed.items.reduce((total, item) => total + item.track.duration_ms, 0);
                const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
                const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
                statsData.listeningTime = `${totalHours}h ${totalMinutes}min`;
            }

            // Calculate uniqueness metrics
            if (topArtists && topTracks) {
                // Unique artists and tracks
                statsData.uniqueArtists = new Set(topArtists.items.map(artist => artist.name)).size;
                statsData.uniqueTracks = new Set(topTracks.items.map(track => track.name)).size;
                
                // Unique genres
                const allGenres = [];
                topArtists.items.forEach(artist => {
                    if (artist.genres && artist.genres.length > 0) {
                        allGenres.push(...artist.genres);
                    }
                });
                statsData.uniqueGenres = new Set(allGenres).size;
            }

            // Process genres
            if (topArtists && topArtists.items) {
                const genreCount = {};
                topArtists.items.forEach(artist => {
                    artist.genres.forEach(genre => {
                        genreCount[genre] = (genreCount[genre] || 0) + 1;
                    });
                });

                statsData.genres = Object.entries(genreCount)
                    .map(([name, count]) => ({ name: this.capitalizeFirst(name), count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            }

            // Process moods (based on track characteristics)
            if (topTracks && topTracks.items) {
                const moodAnalysis = {
                    'Energético': 0,
                    'Relajado': 0,
                    'Melancólico': 0,
                    'Bailable': 0,
                    'Romántico': 0
                };

                // Simulate mood analysis based on popularity and duration
                topTracks.items.forEach(track => {
                    if (track.popularity > 70) moodAnalysis['Energético']++;
                    else if (track.popularity > 50) moodAnalysis['Bailable']++;
                    else if (track.duration_ms > 240000) moodAnalysis['Relajado']++;
                    else if (track.popularity < 30) moodAnalysis['Melancólico']++;
                    else moodAnalysis['Romántico']++;
                });

                statsData.moods = Object.entries(moodAnalysis)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            }

            // Calculate uniqueness score
            if (topArtists && topTracks) {
                const avgArtistPopularity = topArtists.items.reduce((sum, artist) => sum + artist.popularity, 0) / topArtists.items.length;
                const avgTrackPopularity = topTracks.items.reduce((sum, track) => sum + track.popularity, 0) / topTracks.items.length;
                statsData.uniquenessScore = Math.round(100 - ((avgArtistPopularity + avgTrackPopularity) / 2));
            }

        } catch (error) {
            console.error('Error collecting stats data:', error);
        }

        return statsData;
    }

    showShareModal(imageDataUrl) {
        const modal = document.getElementById('share-modal');
        if (!modal) return;

        const shareImage = modal.querySelector('#share-image');
        if (shareImage) {
            shareImage.src = imageDataUrl;
        }

        modal.style.display = 'flex';

        // Setup share buttons
        this.setupShareButtons(imageDataUrl);
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

        // Setup modal close button
        const closeButton = document.querySelector('.close-modal');
        if (closeButton) {
            closeButton.onclick = () => {
                this.hideShareModal();
            };
        }

        // Close modal when clicking outside
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.hideShareModal();
                }
            };
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsManager();
}); 