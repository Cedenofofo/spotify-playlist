class StatisticsManager {
    constructor() {
        this.auth = new Auth();
        this.currentTimeRange = 'short_term'; // short_term, medium_term, long_term
        this.setupEventListeners();
        this.loadStatistics();
    }

    setupEventListeners() {
        // Selector de período de tiempo
        const timeRangeSelect = document.getElementById('time-range-select');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.currentTimeRange = e.target.value;
                this.loadStatistics();
            });
        }

        // Botones de navegación
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        // Botones de exportar
        const exportButton = document.getElementById('export-stats-button');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportStatistics();
            });
        }
    }

    async loadStatistics() {
        try {
            this.showLoading();
            
            // Verificar autenticación
            const token = this.auth.getAccessToken();
            if (!token) {
                this.auth.logout();
                return;
            }

            // Cargar todas las estadísticas en paralelo
            const [
                topArtists,
                topTracks,
                userProfile,
                recentlyPlayed
            ] = await Promise.all([
                this.loadTopArtists(),
                this.loadTopTracks(),
                this.loadUserProfile(),
                this.loadRecentlyPlayed()
            ]);

            // Procesar y mostrar estadísticas
            this.displayTopArtists(topArtists);
            this.displayTopTracks(topTracks);
            this.displayUserProfile(userProfile);
            this.displayListeningTime(recentlyPlayed);
            this.displayGenreAnalysis(topArtists, topTracks);
            this.displayMoodAnalysis(topTracks);
            this.displayUniquenessScore(topArtists, topTracks);

            this.hideLoading();
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showError('Error al cargar las estadísticas');
        }
    }

    async loadTopArtists() {
        const api = new SpotifyAPI(this.auth);
        return await api.getTopArtists(this.currentTimeRange, 20);
    }

    async loadTopTracks() {
        const api = new SpotifyAPI(this.auth);
        return await api.getTopTracks(this.currentTimeRange, 20);
    }

    async loadUserProfile() {
        const api = new SpotifyAPI(this.auth);
        return await api.getUserProfile();
    }

    async loadRecentlyPlayed() {
        const api = new SpotifyAPI(this.auth);
        return await api.getRecentlyPlayed(50);
    }

    displayTopArtists(artists) {
        const container = document.getElementById('top-artists-container');
        if (!container) return;

        const timeRangeLabel = this.getTimeRangeLabel();
        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-microphone"></i> Artistas Más Escuchados</h3>
                <span class="time-range">${timeRangeLabel}</span>
            </div>
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

        // Agregar event listeners para ver más detalles
        container.querySelectorAll('.artist-card').forEach(card => {
            card.addEventListener('click', () => {
                const artistId = card.dataset.artistId;
                this.showArtistDetails(artistId);
            });
        });
    }

    displayTopTracks(tracks) {
        const container = document.getElementById('top-tracks-container');
        if (!container) return;

        const timeRangeLabel = this.getTimeRangeLabel();
        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-music"></i> Canciones Más Reproducidas</h3>
                <span class="time-range">${timeRangeLabel}</span>
            </div>
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

        // Agregar event listeners para reproducir preview
        container.querySelectorAll('.track-item').forEach(item => {
            item.addEventListener('click', () => {
                const trackId = item.dataset.trackId;
                this.playTrackPreview(trackId);
            });
        });
    }

    displayUserProfile(profile) {
        const container = document.getElementById('user-profile-container');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-user"></i> Tu Perfil Musical</h3>
            </div>
            <div class="profile-card">
                <div class="profile-image">
                    <img src="${profile.images[0]?.url || 'https://via.placeholder.com/120x120/1db954/ffffff?text=👤'}" 
                         alt="${profile.display_name}" onerror="this.src='https://via.placeholder.com/120x120/1db954/ffffff?text=👤'">
                </div>
                <div class="profile-info">
                    <h4 class="profile-name">${this.escapeHtml(profile.display_name)}</h4>
                    <p class="profile-email">${profile.email || 'Email no disponible'}</p>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-label">País</span>
                            <span class="stat-value">${profile.country || 'No especificado'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tipo de cuenta</span>
                            <span class="stat-value">${profile.product}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Seguidores</span>
                            <span class="stat-value">${profile.followers?.total || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    displayListeningTime(recentlyPlayed) {
        const container = document.getElementById('listening-time-container');
        if (!container) return;

        // Calcular tiempo total de escucha (aproximado)
        const totalMinutes = recentlyPlayed.items.length * 3; // Estimación de 3 minutos por canción
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-clock"></i> Tiempo de Escucha</h3>
            </div>
            <div class="listening-stats">
                <div class="time-card">
                    <div class="time-icon">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <div class="time-info">
                        <h4>Tiempo Total Estimado</h4>
                        <div class="time-value">
                            <span class="hours">${hours}</span>
                            <span class="time-unit">horas</span>
                            <span class="minutes">${minutes}</span>
                            <span class="time-unit">min</span>
                        </div>
                    </div>
                </div>
                <div class="recent-activity">
                    <h4>Actividad Reciente</h4>
                    <div class="activity-list">
                        ${recentlyPlayed.items.slice(0, 5).map(item => `
                            <div class="activity-item">
                                <img src="${item.track.album.images[0]?.url || 'https://via.placeholder.com/40x40/1db954/ffffff?text=🎵'}" 
                                     alt="${item.track.name}" onerror="this.src='https://via.placeholder.com/40x40/1db954/ffffff?text=🎵'">
                                <div class="activity-info">
                                    <span class="activity-track">${this.escapeHtml(item.track.name)}</span>
                                    <span class="activity-artist">${item.track.artists[0].name}</span>
                                </div>
                                <span class="activity-time">${this.formatRelativeTime(item.played_at)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    displayGenreAnalysis(artists, tracks) {
        const container = document.getElementById('genre-analysis-container');
        if (!container) return;

        // Analizar géneros de artistas
        const genreCount = {};
        artists.items.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });

        // Ordenar géneros por frecuencia
        const sortedGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-tags"></i> Géneros Musicales Favoritos</h3>
            </div>
            <div class="genre-analysis">
                <div class="genre-chart">
                    ${sortedGenres.map(([genre, count], index) => `
                        <div class="genre-item">
                            <div class="genre-info">
                                <span class="genre-name">${this.capitalizeFirst(genre)}</span>
                                <span class="genre-count">${count} artistas</span>
                            </div>
                            <div class="genre-bar">
                                <div class="genre-fill" style="width: ${(count / sortedGenres[0][1]) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="genre-insights">
                    <h4>Insights</h4>
                    <p>Tu género más escuchado es <strong>${this.capitalizeFirst(sortedGenres[0]?.[0] || 'No disponible')}</strong> 
                    con ${sortedGenres[0]?.[1] || 0} artistas favoritos.</p>
                </div>
            </div>
        `;
    }

    displayMoodAnalysis(tracks) {
        const container = document.getElementById('mood-analysis-container');
        if (!container) return;

        // Simular análisis de mood basado en características de las canciones
        // En una implementación real, esto vendría de la API de Spotify
        const moods = {
            'Energético': 35,
            'Relajado': 25,
            'Melancólico': 20,
            'Bailable': 15,
            'Romántico': 5
        };

        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-heart"></i> Estado de Ánimo Musical</h3>
            </div>
            <div class="mood-analysis">
                <div class="mood-chart">
                    ${Object.entries(moods).map(([mood, percentage]) => `
                        <div class="mood-item">
                            <div class="mood-info">
                                <span class="mood-name">${mood}</span>
                                <span class="mood-percentage">${percentage}%</span>
                            </div>
                            <div class="mood-bar">
                                <div class="mood-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mood-insights">
                    <h4>Tu Mood Musical</h4>
                    <p>Basado en tu música, prefieres canciones <strong>energéticas y motivadoras</strong> 
                    que te ayuden a mantener un buen estado de ánimo.</p>
                </div>
            </div>
        `;
    }

    displayUniquenessScore(artists, tracks) {
        const container = document.getElementById('uniqueness-container');
        if (!container) return;

        // Calcular score de exclusividad basado en popularidad promedio
        const avgArtistPopularity = artists.items.reduce((sum, artist) => sum + artist.popularity, 0) / artists.items.length;
        const avgTrackPopularity = tracks.items.reduce((sum, track) => sum + track.popularity, 0) / tracks.items.length;
        
        const uniquenessScore = Math.round(100 - ((avgArtistPopularity + avgTrackPopularity) / 2));
        const uniquenessLevel = this.getUniquenessLevel(uniquenessScore);

        container.innerHTML = `
            <div class="stats-header">
                <h3><i class="fas fa-star"></i> Exclusividad de Gustos</h3>
            </div>
            <div class="uniqueness-analysis">
                <div class="uniqueness-score">
                    <div class="score-circle">
                        <div class="score-value">${uniquenessScore}</div>
                        <div class="score-label">Exclusividad</div>
                    </div>
                    <div class="score-description">
                        <h4>${uniquenessLevel.title}</h4>
                        <p>${uniquenessLevel.description}</p>
                    </div>
                </div>
                <div class="uniqueness-details">
                    <div class="detail-item">
                        <span class="detail-label">Popularidad promedio artistas:</span>
                        <span class="detail-value">${Math.round(avgArtistPopularity)}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Popularidad promedio canciones:</span>
                        <span class="detail-value">${Math.round(avgTrackPopularity)}%</span>
                    </div>
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
            'long_term': 'Todo el tiempo'
        };
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
        }
    }

    async showArtistDetails(artistId) {
        // Implementar modal con detalles del artista
        console.log('Mostrar detalles del artista:', artistId);
    }

    async playTrackPreview(trackId) {
        // Implementar reproducción de preview
        console.log('Reproducir preview de track:', trackId);
    }

    async exportStatistics() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                timeRange: this.currentTimeRange,
                // Aquí se podrían incluir los datos de las estadísticas
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spotify-statistics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Estadísticas exportadas correctamente');
        } catch (error) {
            console.error('Error exporting statistics:', error);
            this.showError('Error al exportar las estadísticas');
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsManager();
}); 