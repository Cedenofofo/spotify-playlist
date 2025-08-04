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
        
        // Crear fondo futurista
        this.createFuturisticBackground();
        
        // Agregar header con diseño moderno
        this.drawModernHeader();
        
        // Agregar estadísticas principales con diseño de tarjetas
        this.drawMainStatisticsCards();
        
        // Agregar top artistas y canciones con diseño de lista moderna
        this.drawTopArtistsAndTracksModern();
        
        // Agregar análisis de géneros y mood con diseño de gráficos
        this.drawGenreAndMoodAnalysisModern();
        
        // Agregar footer con información de la app
        this.drawModernFooter();
        
        return this.canvas.toDataURL('image/png');
    }

    createFuturisticBackground() {
        // Gradiente de fondo futurista
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.2, '#1a1a2e');
        gradient.addColorStop(0.4, '#16213e');
        gradient.addColorStop(0.6, '#0f3460');
        gradient.addColorStop(0.8, '#533483');
        gradient.addColorStop(1, '#0a0a0a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Patrón de líneas futuristas
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.1)';
        this.ctx.lineWidth = 2;
        
        // Líneas horizontales
        for (let i = 0; i < 8; i++) {
            const y = 200 + i * 200;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Líneas diagonales
        this.ctx.strokeStyle = 'rgba(0, 207, 255, 0.08)';
        for (let i = 0; i < 5; i++) {
            const x = i * 300;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x + 200, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Puntos decorativos brillantes
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
        // Logo y título principal con efecto de neón
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 80px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵', this.canvas.width / 2, 140);
        
        // Título principal con gradiente y sombra
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.3, '#00cfff');
        gradient.addColorStop(0.7, '#ff6b35');
        gradient.addColorStop(1, '#1db954');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 72px Inter, sans-serif';
        this.ctx.fillText('Mis Estadísticas', this.canvas.width / 2, 220);
        
        // Subtítulo con efecto de neón
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.fillText('Tuneuptify', this.canvas.width / 2, 260);
        
        // Línea separadora con efecto de neón
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(100, 300);
        this.ctx.lineTo(this.canvas.width - 100, 300);
        this.ctx.stroke();
    }

    drawMainStatisticsCards() {
        const startY = 400;
        const cardHeight = 140;
        const cardWidth = 480;
        const margin = 40;
        
        // Tiempo de escucha con diseño de tarjeta moderna
        this.drawModernStatCard('⏱️ Tiempo de Escucha', this.statsData.listeningTime || '0h 0min', startY, 50, cardWidth, '#1db954');
    }

    drawModernStatCard(title, value, y, x, width, color) {
        // Fondo de la tarjeta con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.roundRect(x, y, width, 120, 20);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Efecto de brillo en la parte superior
        const gradient = this.ctx.createLinearGradient(x, y, x, y + 120);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.roundRect(x, y, width, 60, 20);
        this.ctx.fill();
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 25, y + 45);
        
        // Valor con efecto de neón
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.fillText(value, x + 25, y + 95);
    }

    drawTopArtistsAndTracksModern() {
        const startY = 700; // Increased starting position
        
        // Título de sección con diseño moderno
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎤 Top 5 Artistas', this.canvas.width / 2, startY);
        
        // Top 5 Artistas con diseño de tarjetas modernas
        if (this.statsData.topArtists?.items) {
            const artists = this.statsData.topArtists.items.slice(0, 5);
            artists.forEach((artist, index) => {
                const y = startY + 80 + (index * 100); // Increased spacing between items
                this.drawModernArtistItem(artist, index + 1, y);
            });
        }
        
        // Título de canciones - moved further down
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.fillText('🎵 Top 5 Canciones', this.canvas.width / 2, startY + 700); // Increased spacing
        
        // Top 5 Canciones con diseño de tarjetas modernas
        if (this.statsData.topTracks?.items) {
            const tracks = this.statsData.topTracks.items.slice(0, 5);
            tracks.forEach((track, index) => {
                const y = startY + 760 + (index * 100); // Increased spacing between items
                this.drawModernTrackItem(track, index + 1, y);
            });
        }
    }

    drawModernArtistItem(artist, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 80, 15); // Increased height
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking con diseño de badge
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 30, y + 50);
        
        // Nombre del artista (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        let artistName = artist.name;
        const maxWidth = width - 300; // Increased space for text
        
        while (this.ctx.measureText(artistName).width > maxWidth && artistName.length > 0) {
            artistName = artistName.slice(0, -1);
        }
        
        this.ctx.fillText(artistName, x + 120, y + 50);
        
        // Popularidad con barra de progreso moderna
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${artist.popularity}%`, x + width - 30, y + 50);
        
        // Barra de progreso
        const barWidth = 140; // Increased bar width
        const barHeight = 10; // Increased bar height
        const barX = x + width - 180;
        const barY = y + 60;
        
        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(barX, barY, barWidth, barHeight, 5);
        this.ctx.fill();
        
        // Fill de la barra
        this.ctx.fillStyle = '#1db954';
        this.roundRect(barX, barY, (artist.popularity / 100) * barWidth, barHeight, 5);
        this.ctx.fill();
    }

    drawModernTrackItem(track, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(0, 207, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 80, 15); // Increased height
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking con diseño de badge
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 30, y + 50);
        
        // Nombre de la canción (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        let trackName = track.name;
        const maxWidth = width - 300; // Increased space for text
        
        while (this.ctx.measureText(trackName).width > maxWidth && trackName.length > 0) {
            trackName = trackName.slice(0, -1);
        }
        
        this.ctx.fillText(trackName, x + 120, y + 50);
        
        // Artista en el lado derecho
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        
        let artistName = track.artists[0].name;
        const artistMaxWidth = 200;
        
        while (this.ctx.measureText(artistName).width > artistMaxWidth && artistName.length > 0) {
            artistName = artistName.slice(0, -1);
        }
        
        this.ctx.fillText(artistName, x + width - 30, y + 50);
    }

    drawGenreAndMoodAnalysisModern() {
        const startY = 1600; // Moved further down to avoid overlap
        
        // Título de géneros con diseño moderno
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 44px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎼 Top 3 Géneros', this.canvas.width / 2, startY);
        
        // Top 3 Géneros con diseño de gráficos circulares
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const genres = this.statsData.genres.slice(0, 3);
            genres.forEach((genre, index) => {
                const y = startY + 80 + (index * 100); // Increased spacing
                this.drawModernGenreItem(genre, index + 1, y);
            });
        }
        
        // Título de mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 44px Inter, sans-serif';
        this.ctx.fillText('💫 Top 3 Estados de Ánimo', this.canvas.width / 2, startY + 420); // Increased spacing
        
        // Top 3 Estados de ánimo con diseño de gráficos circulares
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const moods = this.statsData.moods.slice(0, 3);
            moods.forEach((mood, index) => {
                const y = startY + 480 + (index * 100); // Increased spacing
                this.drawModernMoodItem(mood, index + 1, y);
            });
        }
    }

    drawModernGenreItem(genre, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 80, 15); // Increased height
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 30, y + 50);
        
        // Nombre del género
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.fillText(genre.name, x + 100, y + 50);
        
        // Contador de artistas
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${genre.count} artistas`, x + width - 30, y + 50);
    }

    drawModernMoodItem(mood, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 80, 15); // Increased height
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 30, y + 50);
        
        // Nombre del mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.fillText(mood.name, x + 100, y + 50);
        
        // Contador de canciones
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${mood.count} canciones`, x + width - 30, y + 50);
    }

    drawModernFooter() {
        const startY = 2000; // Moved further down to avoid overlap
        
        // Línea separadora con efecto de neón
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(100, startY);
        this.ctx.lineTo(this.canvas.width - 100, startY);
        this.ctx.stroke();
        
        // Logo y branding
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Tuneuptify', this.canvas.width / 2, startY + 60);
        
        // URL y descripción
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText('tuneuptify.com', this.canvas.width / 2, startY + 100);
        
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.fillText('Descubre insights únicos sobre tus hábitos de escucha', this.canvas.width / 2, startY + 140);
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