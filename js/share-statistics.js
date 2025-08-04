class ShareStatistics {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.statsData = null;
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1080;  // Ancho para historias de Instagram
        this.canvas.height = 1920; // Alto para historias de Instagram
        this.ctx = this.canvas.getContext('2d');
    }

    async generateStoryImage(statsData) {
        this.statsData = statsData;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Crear fondo mejorado
        this.createModernBackground();
        
        // Agregar header con branding
        this.drawModernHeader();
        
        // Agregar estadísticas principales
        this.drawMainStatistics();
        
        // Agregar top artistas y canciones
        this.drawTopArtistsAndTracks();
        
        // Agregar análisis de géneros y mood
        this.drawGenreAndMoodAnalysis();
        
        // Agregar footer con información de la app
        this.drawModernFooter();
        
        return this.canvas.toDataURL('image/png');
    }

    createModernBackground() {
        // Gradiente de fondo moderno
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.2, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(0.8, '#0f3460');
        gradient.addColorStop(1, '#0a0a0a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Patrón de puntos decorativos
        this.ctx.fillStyle = 'rgba(29, 185, 84, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Líneas de conexión sutiles
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const y = 300 + i * 200;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawModernHeader() {
        // Logo y título principal
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 72px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵', this.canvas.width / 2, 120);
        
        // Título principal con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.5, '#00cfff');
        gradient.addColorStop(1, '#1db954');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 64px Inter, sans-serif';
        this.ctx.fillText('Mis Estadísticas', this.canvas.width / 2, 200);
        
        // Subtítulo
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.fillText('Tuneuptify', this.canvas.width / 2, 240);
        
        // Línea separadora
        this.ctx.strokeStyle = '#1db954';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2 - 150, 280);
        this.ctx.lineTo(this.canvas.width / 2 + 150, 280);
        this.ctx.stroke();
    }

    drawMainStatistics() {
        const startY = 350;
        const cardHeight = 120;
        const cardWidth = 480;
        const margin = 30;
        
        // Tiempo de escucha
        this.drawStatCard('⏱️ Tiempo de Escucha', this.statsData.listeningTime || '0h 0min', startY, 50, cardWidth, '#1db954');
    }

    drawStatCard(title, value, y, x, width, color) {
        // Fondo de la tarjeta
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 100, 15);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 20, y + 35);
        
        // Valor
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.fillText(value, x + 20, y + 75);
    }

    drawTopArtistsAndTracks() {
        const startY = 650;
        
        // Título de sección
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 40px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎤 Top 5 Artistas', this.canvas.width / 2, startY);
        
        // Top 5 Artistas
        if (this.statsData.topArtists?.items) {
            const artists = this.statsData.topArtists.items.slice(0, 5);
            artists.forEach((artist, index) => {
                const y = startY + 50 + (index * 80);
                this.drawArtistItem(artist, index + 1, y);
            });
        }
        
        // Título de canciones
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 40px Inter, sans-serif';
        this.ctx.fillText('🎵 Top 5 Canciones', this.canvas.width / 2, startY + 500);
        
        // Top 5 Canciones
        if (this.statsData.topTracks?.items) {
            const tracks = this.statsData.topTracks.items.slice(0, 5);
            tracks.forEach((track, index) => {
                const y = startY + 550 + (index * 80);
                this.drawTrackItem(track, index + 1, y);
            });
        }
    }

    drawArtistItem(artist, rank, y) {
        const x = 50;
        const width = this.canvas.width - 100;
        
        // Fondo del item
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(x, y, width, 60, 10);
        this.ctx.fill();
        
        // Ranking
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 40);
        
        // Nombre del artista (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        let artistName = artist.name;
        const maxWidth = width - 200; // Dejar espacio para ranking y popularidad
        
        // Truncar nombre si es muy largo
        while (this.ctx.measureText(artistName).width > maxWidth && artistName.length > 0) {
            artistName = artistName.slice(0, -1);
        }
        
        this.ctx.fillText(artistName, x + 80, y + 40);
        
        // Popularidad
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${artist.popularity}%`, x + width - 20, y + 40);
    }

    drawTrackItem(track, rank, y) {
        const x = 50;
        const width = this.canvas.width - 100;
        
        // Fondo del item
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(x, y, width, 60, 10);
        this.ctx.fill();
        
        // Ranking
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 35);
        
        // Nombre de la canción (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        let trackName = track.name;
        const maxWidth = width - 250; // Dejar espacio para ranking y artista
        
        // Truncar nombre si es muy largo
        while (this.ctx.measureText(trackName).width > maxWidth && trackName.length > 0) {
            trackName = trackName.slice(0, -1);
        }
        
        this.ctx.fillText(trackName, x + 80, y + 35);
        
        // Artista (moved to right side, truncated if too long)
        const artistName = track.artists.map(a => a.name).join(', ');
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        
        let displayArtistName = artistName;
        const artistMaxWidth = width - 200; // Dejar espacio para ranking y track name
        
        // Truncar nombre del artista si es muy largo
        while (this.ctx.measureText(displayArtistName).width > artistMaxWidth && displayArtistName.length > 0) {
            displayArtistName = displayArtistName.slice(0, -1);
        }
        
        this.ctx.fillText(displayArtistName, x + width - 20, y + 40);
    }

    drawGenreAndMoodAnalysis() {
        const startY = 1400;
        
        // Título de géneros
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎼 Top 3 Géneros', this.canvas.width / 2, startY);
        
        // Top 3 Géneros
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const genres = this.statsData.genres.slice(0, 3);
            genres.forEach((genre, index) => {
                const y = startY + 50 + (index * 60);
                this.drawGenreItem(genre, index + 1, y);
            });
        }
        
        // Título de mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.fillText('💫 Top 3 Estados de Ánimo', this.canvas.width / 2, startY + 250);
        
        // Top 3 Moods
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const moods = this.statsData.moods.slice(0, 3);
            moods.forEach((mood, index) => {
                const y = startY + 300 + (index * 60);
                this.drawMoodItem(mood, index + 1, y);
            });
        }
    }

    drawGenreItem(genre, rank, y) {
        const x = 50;
        const width = this.canvas.width - 100;
        
        // Fondo del item
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(x, y, width, 40, 8);
        this.ctx.fill();
        
        // Ranking
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 28);
        
        // Nombre del género
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText(genre.name, x + 80, y + 28);
        
        // Porcentaje
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${genre.count} artistas`, x + width - 20, y + 28);
    }

    drawMoodItem(mood, rank, y) {
        const x = 50;
        const width = this.canvas.width - 100;
        
        // Fondo del item
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.roundRect(x, y, width, 40, 8);
        this.ctx.fill();
        
        // Ranking
        this.ctx.fillStyle = '#9c27b0';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 28);
        
        // Nombre del mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText(mood.name, x + 80, y + 28);
        
        // Porcentaje
        this.ctx.fillStyle = '#9c27b0';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${mood.count} canciones`, x + width - 20, y + 28);
    }

    drawModernFooter() {
        const startY = 1750;
        
        // Línea separadora
        this.ctx.strokeStyle = '#1db954';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, startY);
        this.ctx.lineTo(this.canvas.width - 50, startY);
        this.ctx.stroke();
        
        // Logo y nombre de la app
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Tuneuptify', this.canvas.width / 2, startY + 60);
        
        // URL de la app
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText('cedenofofo.github.io/spotify-playlist', this.canvas.width / 2, startY + 100);
        
        // Texto adicional
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.fillText('Descubre tus estadísticas musicales', this.canvas.width / 2, startY + 130);
    }

    // Función auxiliar para crear rectángulos redondeados
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
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async shareToSocialMedia(imageDataUrl, platform) {
        try {
            switch (platform) {
                case 'twitter':
                    this.shareToTwitter(imageDataUrl);
                    break;
                case 'facebook':
                    this.shareToFacebook(imageDataUrl);
                    break;
                case 'instagram':
                    this.shareToInstagram(imageDataUrl);
                    break;
                case 'download':
                    this.downloadImage(imageDataUrl);
                    break;
                default:
                    this.shareNative(imageDataUrl);
                    break;
            }
        } catch (error) {
            console.error('Error sharing to social media:', error);
            this.showNotification('Error al compartir. Intenta de nuevo.', 'error');
        }
    }

    shareToTwitter(imageDataUrl) {
        const text = encodeURIComponent('🎵 ¡Mira mis estadísticas de Spotify con Tuneuptify! #Spotify #Música #Estadísticas');
        const url = encodeURIComponent('https://cedenofofo.github.io/spotify-playlist');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitterUrl, '_blank');
        this.showNotification('Redirigiendo a Twitter...', 'success');
    }

    shareToFacebook(imageDataUrl) {
        const url = encodeURIComponent('https://cedenofofo.github.io/spotify-playlist');
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(facebookUrl, '_blank');
        this.showNotification('Redirigiendo a Facebook...', 'success');
    }

    shareToInstagram(imageDataUrl) {
        // Para Instagram, descargamos la imagen y damos instrucciones
        this.downloadImage(imageDataUrl);
        this.showInstagramInstructions();
    }

    downloadImage(imageDataUrl) {
        const link = document.createElement('a');
        link.download = 'mis-estadisticas-spotify.png';
        link.href = imageDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Imagen descargada correctamente', 'success');
    }

    shareNative(imageDataUrl) {
        if (navigator.share) {
            navigator.share({
                title: 'Mis Estadísticas de Spotify',
                text: '🎵 ¡Mira mis estadísticas musicales con Tuneuptify!',
                url: 'https://cedenofofo.github.io/spotify-playlist'
            }).then(() => {
                this.showNotification('Compartido correctamente', 'success');
            }).catch((error) => {
                console.error('Error sharing:', error);
                this.showNotification('Error al compartir', 'error');
            });
        } else {
            // Fallback: copiar al portapapeles
            this.copyToClipboard('https://cedenofofo.github.io/spotify-playlist');
            this.showNotification('URL copiada al portapapeles', 'success');
        }
    }

    showInstagramInstructions() {
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
        `;

        content.innerHTML = `
            <h3 style="color: #1db954; margin-bottom: 1rem;">📱 Para Instagram</h3>
            <p style="margin-bottom: 1rem;">La imagen se ha descargado automáticamente. Para compartir en Instagram:</p>
            <ol style="text-align: left; margin-bottom: 1rem;">
                <li>Abre Instagram</li>
                <li>Ve a tu perfil</li>
                <li>Toca el botón "+"</li>
                <li>Selecciona "Historia"</li>
                <li>Sube la imagen descargada</li>
                <li>¡Comparte tu música!</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #1db954;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
            ">Entendido</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#1db954' : '#ff4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}