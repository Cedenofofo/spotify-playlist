class ShareStatistics {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.statsData = null;
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1080;
        this.canvas.height = 1920;
        this.ctx = this.canvas.getContext('2d');
    }

    async generateStoryImage(statsData) {
        this.statsData = statsData;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.createFuturisticBackground();
        this.drawModernHeader();
        this.drawMainStatisticsCards();
        this.drawTopArtistsAndTracksModern();
        this.drawGenreAndMoodAnalysisModern();
        this.drawModernFooter();
        
        return this.canvas.toDataURL('image/png');
    }

    createFuturisticBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.2, '#1a1a2e');
        gradient.addColorStop(0.4, '#16213e');
        gradient.addColorStop(0.6, '#0f3460');
        gradient.addColorStop(0.8, '#533483');
        gradient.addColorStop(1, '#0a0a0a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.1)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 8; i++) {
            const y = 200 + i * 200;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = 'rgba(0, 207, 255, 0.08)';
        for (let i = 0; i < 5; i++) {
            const x = i * 300;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x + 200, this.canvas.height);
            this.ctx.stroke();
        }
        
        this.ctx.fillStyle = 'rgba(29, 185, 84, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 4 + 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    drawModernHeader() {
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 80px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵', this.canvas.width / 2, 140);
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.5, '#00cfff');
        gradient.addColorStop(1, '#1db954');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 72px Inter, sans-serif';
        this.ctx.fillText('Tuneuptify', this.canvas.width / 2, 220);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '36px Inter, sans-serif';
        this.ctx.fillText('Estadísticas de Spotify', this.canvas.width / 2, 280);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.fillText(this.getTimeRangeLabel(), this.canvas.width / 2, 320);
    }

    drawMainStatisticsCards() {
        const stats = this.statsData;
        
        this.drawModernStatCard('Canciones', stats.totalTracks || 0, 400, 80, 400, '#1db954');
        this.drawModernStatCard('Artistas', stats.totalArtists || 0, 400, 600, 400, '#00cfff');
        this.drawModernStatCard('Horas', Math.round((stats.totalDuration || 0) / 3600000), 600, 80, 400, '#ff6b6b');
        this.drawModernStatCard('Géneros', stats.totalGenres || 0, 600, 600, 400, '#feca57');
    }

    drawModernStatCard(title, value, y, x, width, color) {
        this.roundRect(x, y, width, 120, 20);
        this.ctx.fillStyle = `rgba(${color === '#1db954' ? '29, 185, 84' : color === '#00cfff' ? '0, 207, 255' : color === '#ff6b6b' ? '255, 107, 107' : '254, 202, 87'}, 0.1)`;
        this.ctx.fill();
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(value.toString(), x + width / 2, y + 60);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.fillText(title, x + width / 2, y + 95);
    }

    drawTopArtistsAndTracksModern() {
        const stats = this.statsData;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🎤 Top Artistas', 80, 800);
        
        if (stats.topArtists && stats.topArtists.length > 0) {
            stats.topArtists.slice(0, 3).forEach((artist, index) => {
                this.drawModernArtistItem(artist, index + 1, 850 + index * 120);
            });
        }
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.fillText('🎵 Top Canciones', 600, 800);
        
        if (stats.topTracks && stats.topTracks.length > 0) {
            stats.topTracks.slice(0, 3).forEach((track, index) => {
                this.drawModernTrackItem(track, index + 1, 850 + index * 120);
            });
        }
    }

    drawModernArtistItem(artist, rank, y) {
        const x = 80;
        const width = 400;
        const height = 100;
        
        this.roundRect(x, y, width, height, 15);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 35);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.fillText(artist.name, x + 80, y + 35);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.fillText(`${artist.followers?.toLocaleString() || 0} seguidores`, x + 80, y + 60);
        
        if (artist.genres && artist.genres.length > 0) {
            this.ctx.fillStyle = '#1db954';
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.fillText(artist.genres[0], x + 80, y + 85);
        }
    }

    drawModernTrackItem(track, rank, y) {
        const x = 600;
        const width = 400;
        const height = 100;
        
        this.roundRect(x, y, width, height, 15);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 35);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Inter, sans-serif';
        this.ctx.fillText(track.name, x + 80, y + 35);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.fillText(track.artists?.[0]?.name || 'Artista desconocido', x + 80, y + 60);
        
        if (track.album) {
            this.ctx.fillStyle = '#00cfff';
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.fillText(track.album.name, x + 80, y + 85);
        }
    }

    drawGenreAndMoodAnalysisModern() {
        const stats = this.statsData;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🎼 Géneros Favoritos', 80, 1250);
        
        if (stats.topGenres && stats.topGenres.length > 0) {
            stats.topGenres.slice(0, 3).forEach((genre, index) => {
                this.drawModernGenreItem(genre, index + 1, 1300 + index * 80);
            });
        }
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.fillText('🎭 Mood Musical', 600, 1250);
        
        if (stats.topMoods && stats.topMoods.length > 0) {
            stats.topMoods.slice(0, 3).forEach((mood, index) => {
                this.drawModernMoodItem(mood, index + 1, 1300 + index * 80);
            });
        }
    }

    drawAdditionalMetrics(startY) {
        const stats = this.statsData;
        
        this.drawMetricCard('Promedio', `${Math.round(stats.avgPopularity || 0)}%`, startY, 80, 300, 80, '#ff6b6b');
        this.drawMetricCard('Diversidad', `${Math.round(stats.diversityScore || 0)}%`, startY, 400, 300, 80, '#feca57');
        this.drawMetricCard('Energía', `${Math.round(stats.avgEnergy || 0)}%`, startY, 720, 300, 80, '#1db954');
    }

    drawMetricCard(title, value, y, x, width, height, color) {
        this.roundRect(x, y, width, height, 15);
        this.ctx.fillStyle = `rgba(${color === '#ff6b6b' ? '255, 107, 107' : color === '#feca57' ? '254, 202, 87' : '29, 185, 84'}, 0.1)`;
        this.ctx.fill();
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(value, x + width / 2, y + 35);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.fillText(title, x + width / 2, y + 60);
    }

    getTimeRangeLabel() {
        const timeRange = this.statsData.timeRange || 'short_term';
        const labels = {
            'short_term': 'Últimas 4 semanas',
            'medium_term': 'Últimos 6 meses',
            'long_term': 'Todo el tiempo'
        };
        return labels[timeRange] || 'Últimas 4 semanas';
    }

    drawModernGenreItem(genre, rank, y) {
        const x = 80;
        const width = 400;
        const height = 60;
        
        this.roundRect(x, y, width, height, 10);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 35);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Inter, sans-serif';
        this.ctx.fillText(genre.name || 'Género desconocido', x + 80, y + 35);
    }

    drawModernMoodItem(mood, rank, y) {
        const x = 600;
        const width = 400;
        const height = 60;
        
        this.roundRect(x, y, width, height, 10);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 35);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Inter, sans-serif';
        this.ctx.fillText(mood.name || 'Mood desconocido', x + 80, y + 35);
    }

    drawModernFooter() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Creado con Tuneuptify', this.canvas.width / 2, this.canvas.height - 60);
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    formatDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    async shareToSocialMedia(imageDataUrl, platform) {
        try {
            if (platform === 'download') {
                this.downloadImage(imageDataUrl);
            } else {
                this.downloadImage(imageDataUrl);
            }
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showNotification('Error al descargar la imagen. Intenta de nuevo.', 'error');
        }
    }

    downloadImage(imageDataUrl) {
        const link = document.createElement('a');
        link.download = `tuneuptify-stats-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageDataUrl;
        link.click();
    }

    showNotification(message, type = 'info') {
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

window.ShareStatistics = ShareStatistics;