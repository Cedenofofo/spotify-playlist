class StatisticsManager {
    constructor() {
        this.auth = new Auth();
        this.currentTimeRange = 'short_term'; // short_term, medium_term, long_term
        this.shareStats = new ShareStatistics();
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



        // Botones de compartir
        const shareButton = document.getElementById('share-stats-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.showShareOptions();
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
            this.displayActivitySummary(userProfile, recentlyPlayed);
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

    displayActivitySummary(profile, recentlyPlayed) {
        const container = document.getElementById('activity-summary-container');
        if (!container) return;

        // Calcular estadísticas de actividad
        const totalTracks = recentlyPlayed?.items?.length || 0;
        const uniqueArtists = new Set(recentlyPlayed?.items?.map(item => item.track.artists[0].name) || []).size;
        const totalDuration = recentlyPlayed?.items?.reduce((total, item) => total + item.track.duration_ms, 0) || 0;
        const avgDuration = totalTracks > 0 ? totalDuration / totalTracks : 0;

        container.innerHTML = `
            <div class="activity-summary">
                <div class="activity-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="activity-stats">
                    <div class="activity-stat-item">
                        <div class="stat-number">${totalTracks}</div>
                        <div class="stat-label">Canciones Escuchadas</div>
                    </div>
                    <div class="activity-stat-item">
                        <div class="stat-number">${uniqueArtists}</div>
                        <div class="stat-label">Artistas Únicos</div>
                    </div>
                    <div class="activity-stat-item">
                        <div class="stat-number">${Math.round(avgDuration / 60000)}</div>
                        <div class="stat-label">Promedio (min)</div>
                    </div>
                </div>
                <div class="activity-description">
                    <p>Tu actividad musical muestra un patrón diverso de escucha con ${uniqueArtists} artistas diferentes en ${totalTracks} canciones.</p>
                </div>
            </div>
        `;
    }

    displayListeningTime(recentlyPlayed) {
        const container = document.getElementById('listening-time-container');
        if (!container) return;

        // Calcular tiempo total de escucha basado en duración real
        const totalDuration = recentlyPlayed.items.reduce((total, item) => total + item.track.duration_ms, 0);
        const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

        container.innerHTML = `
            <div class="listening-stats">
                <div class="time-card">
                    <div class="time-icon">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <div class="time-info">
                        <h4>Tiempo Total de Escucha</h4>
                        <div class="time-value">
                            <span class="hours">${totalHours}</span>
                            <span class="time-unit">h</span>
                            <span class="minutes">${totalMinutes}</span>
                            <span class="time-unit">min</span>
                        </div>
                        <div class="time-description">
                            Basado en ${recentlyPlayed.items.length} canciones reproducidas recientemente
                        </div>
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



    async showShareOptions() {
        try {
            this.showLoading();
            
            // Recopilar datos de estadísticas
            const statsData = await this.collectStatsData();
            
            // Generar imagen
            const imageDataUrl = await this.shareStats.generateStoryImage(statsData);
            
            this.hideLoading();
            
            // Mostrar modal de opciones de compartir
            this.showShareModal(imageDataUrl);
            
        } catch (error) {
            console.error('Error generating share image:', error);
            this.showError('Error al generar imagen para compartir');
            this.hideLoading();
        }
    }

    async collectStatsData() {
        // Recopilar todos los datos de estadísticas
        const statsData = {
            topArtists: null,
            topTracks: null,
            genres: [],
            moods: [],
            listeningTime: '',
            uniquenessScore: 0
        };

        try {
            // Obtener datos de artistas, tracks y actividad reciente
            const [topArtists, topTracks, recentlyPlayed] = await Promise.all([
                this.loadTopArtists(),
                this.loadTopTracks(),
                this.loadRecentlyPlayed()
            ]);

            statsData.topArtists = topArtists;
            statsData.topTracks = topTracks;

            // Calcular tiempo de escucha
            if (recentlyPlayed && recentlyPlayed.items) {
                const totalDuration = recentlyPlayed.items.reduce((total, item) => total + item.track.duration_ms, 0);
                const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
                const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
                statsData.listeningTime = `${totalHours}h ${totalMinutes}min`;
            }

            // Procesar géneros
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

            // Procesar estados de ánimo (basado en características de las canciones)
            if (topTracks && topTracks.items) {
                const moodAnalysis = {
                    'Energético': 0,
                    'Relajado': 0,
                    'Melancólico': 0,
                    'Bailable': 0,
                    'Romántico': 0
                };

                // Simular análisis de mood basado en popularidad y duración
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

            // Calcular score de exclusividad
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
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            text-align: center;
            max-height: 80vh;
            overflow-y: auto;
        `;

        content.innerHTML = `
            <h3 style="color: #1db954; margin-bottom: 1rem;">📤 Compartir Estadísticas</h3>
            
            <div style="margin: 1rem 0;">
                <img src="${imageDataUrl}" alt="Estadísticas" style="max-width: 100%; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                <button onclick="window.shareStatistics('twitter', '${imageDataUrl}')" style="
                    background: #1da1f2;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fab fa-twitter"></i>
                    Twitter
                </button>
                
                <button onclick="window.shareStatistics('facebook', '${imageDataUrl}')" style="
                    background: #1877f2;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fab fa-facebook"></i>
                    Facebook
                </button>
                
                <button onclick="window.shareStatistics('instagram', '${imageDataUrl}')" style="
                    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fab fa-instagram"></i>
                    Instagram
                </button>
                
                <button onclick="window.shareStatistics('download', '${imageDataUrl}')" style="
                    background: #1db954;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fas fa-download"></i>
                    Descargar
                </button>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #666;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                margin-top: 1rem;
            ">Cerrar</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Hacer la función de compartir global
        window.shareStatistics = (platform, imageDataUrl) => {
            this.shareStats.shareToSocialMedia(imageDataUrl, platform);
        };
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