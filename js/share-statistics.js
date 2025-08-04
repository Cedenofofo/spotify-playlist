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
        // Removed metric cards to improve visibility of other information
        // The cards were taking up space and overlapping with other content
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
        const startY = 450; // Moved up slightly
        
        // Título de sección con diseño moderno
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎤 Top 3 Artistas', this.canvas.width / 2, startY);
        
        // Top 3 Artistas con diseño de tarjetas modernas
        if (this.statsData.topArtists?.items) {
            const artists = this.statsData.topArtists.items.slice(0, 3); // Changed from 5 to 3
            artists.forEach((artist, index) => {
                const y = startY + 60 + (index * 70); // Reduced spacing between items
                this.drawModernArtistItem(artist, index + 1, y);
            });
        }
        
        // Título de canciones - moved further down to avoid overlap
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif'; // Reduced font size
        this.ctx.fillText('🎵 Top 3 Canciones', this.canvas.width / 2, startY + 400); // Increased spacing
        
        // Top 3 Canciones con diseño de tarjetas modernas
        if (this.statsData.topTracks?.items) {
            const tracks = this.statsData.topTracks.items.slice(0, 3); // Changed from 5 to 3
            tracks.forEach((track, index) => {
                const y = startY + 460 + (index * 70); // Increased spacing between items
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
        this.roundRect(x, y, width, 60, 12); // Reduced height from 80 to 60
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking con diseño de badge
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 24px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 25, y + 40); // Adjusted position
        
        // Nombre del artista (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        
        let artistName = artist.name;
        const maxWidth = width - 250; // Reduced space for text
        
        while (this.ctx.measureText(artistName).width > maxWidth && artistName.length > 0) {
            artistName = artistName.slice(0, -1);
        }
        
        this.ctx.fillText(artistName, x + 100, y + 40); // Adjusted position
        
        // Popularidad con barra de progreso moderna
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 22px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${artist.popularity}%`, x + width - 25, y + 40); // Adjusted position
        
        // Barra de progreso
        const barWidth = 120; // Reduced bar width
        const barHeight = 8; // Reduced bar height
        const barX = x + width - 150;
        const barY = y + 45; // Adjusted position
        
        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(barX, barY, barWidth, barHeight, 4);
        this.ctx.fill();
        
        // Fill de la barra
        this.ctx.fillStyle = '#1db954';
        this.roundRect(barX, barY, (artist.popularity / 100) * barWidth, barHeight, 4);
        this.ctx.fill();
    }

    drawModernTrackItem(track, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(0, 207, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 60, 12); // Reduced height from 80 to 60
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking con diseño de badge
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 24px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 25, y + 40); // Adjusted position
        
        // Nombre de la canción (truncado si es muy largo)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        
        let trackName = track.name;
        const maxWidth = width - 250; // Reduced space for text
        
        while (this.ctx.measureText(trackName).width > maxWidth && trackName.length > 0) {
            trackName = trackName.slice(0, -1);
        }
        
        this.ctx.fillText(trackName, x + 100, y + 40); // Adjusted position
        
        // Artista en el lado derecho
        this.ctx.fillStyle = '#00cfff';
        this.ctx.font = 'bold 22px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'right';
        
        let artistName = track.artists[0].name;
        const artistMaxWidth = 180; // Reduced max width
        
        while (this.ctx.measureText(artistName).width > artistMaxWidth && artistName.length > 0) {
            artistName = artistName.slice(0, -1);
        }
        
        this.ctx.fillText(artistName, x + width - 25, y + 40); // Adjusted position
    }

    drawGenreAndMoodAnalysisModern() {
        const startY = 1100; // Moved up from 1000 to avoid overlap with songs
        
        // Título de géneros
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎼 Top 3 Géneros', this.canvas.width / 2, startY);
        
        // Top 3 Géneros con diseño de gráficos circulares
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const genres = this.statsData.genres.slice(0, 3);
            genres.forEach((genre, index) => {
                const y = startY + 50 + (index * 60); // Reduced spacing
                this.drawModernGenreItem(genre, index + 1, y);
            });
        }
        
        // Título de mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif'; // Reduced font size
        this.ctx.fillText('💫 Top 3 Estados de Ánimo', this.canvas.width / 2, startY + 280); // Reduced spacing
        
        // Top 3 Estados de ánimo con diseño de gráficos circulares
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const moods = this.statsData.moods.slice(0, 3);
            moods.forEach((mood, index) => {
                const y = startY + 330 + (index * 60); // Reduced spacing
                this.drawModernMoodItem(mood, index + 1, y);
            });
        }
        
        // Agregar cuadros de métricas adicionales
        this.drawAdditionalMetrics(startY + 580); // Start after moods section
    }
    
    drawAdditionalMetrics(startY) {
        const cardWidth = 300;
        const cardHeight = 80;
        const margin = 40;
        const totalWidth = (cardWidth * 2) + margin;
        const startX = (this.canvas.width - totalWidth) / 2;
        
        // Cuadro de tiempo de escucha
        this.drawMetricCard('⏱️ Tiempo de Escucha', this.statsData.listeningTime || '0h 0min', startY, startX, cardWidth, cardHeight, '#1db954');
        
        // Cuadro de período seleccionado
        const timeRangeLabel = this.getTimeRangeLabel();
        this.drawMetricCard('📅 Período', timeRangeLabel, startY, startX + cardWidth + margin, cardWidth, cardHeight, '#00cfff');
    }
    
    drawMetricCard(title, value, y, x, width, height, color) {
        // Fondo de la tarjeta con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, height, 15);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Efecto de brillo en la parte superior
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.roundRect(x, y, width, height / 2, 15);
        this.ctx.fill();
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, x + width / 2, y + 25);
        
        // Valor
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText(value, x + width / 2, y + 55);
    }
    
    getTimeRangeLabel() {
        const timeRange = document.getElementById('time-range-select')?.value || 'short_term';
        const labels = {
            'short_term': 'Últimas 4 semanas',
            'medium_term': 'Últimos 6 meses',
            'long_term': 'Todo el tiempo',
            'custom_year': 'Último año',
            'custom_range': 'Rango personalizado'
        };
        return labels[timeRange] || 'Últimas 4 semanas';
    }

    drawModernGenreItem(genre, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 50, 10); // Reduced height from 80 to 50
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 20px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 32); // Adjusted position
        
        // Nombre del género
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif'; // Reduced font size
        this.ctx.fillText(genre.name, x + 80, y + 32); // Adjusted position
        
        // Contador de artistas
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 18px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${genre.count} artistas`, x + width - 20, y + 32); // Adjusted position
    }

    drawModernMoodItem(mood, rank, y) {
        const x = 60; // Increased margin
        const width = this.canvas.width - 120; // Adjusted width
        
        // Fondo del item con efecto de cristal
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, width, 50, 10); // Reduced height from 80 to 50
        this.ctx.fill();
        this.ctx.stroke();
        
        // Ranking
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 20px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`#${rank}`, x + 20, y + 32); // Adjusted position
        
        // Nombre del mood
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif'; // Reduced font size
        this.ctx.fillText(mood.name, x + 80, y + 32); // Adjusted position
        
        // Contador de canciones
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = 'bold 18px Inter, sans-serif'; // Reduced font size
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${mood.count} canciones`, x + width - 20, y + 32); // Adjusted position
    }

    drawModernFooter() {
        // Footer removed to clean up the design
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
        // Para Twitter/X, intentamos usar la Web Share API con imagen
        if (navigator.share && navigator.canShare) {
            // Convertir la imagen a Blob para compartir
            fetch(imageDataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'estadisticas-spotify.png', { type: 'image/png' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            title: 'Mis Estadísticas de Spotify',
                            text: 'Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify',
                            files: [file]
                        }).then(() => {
                            this.showNotification('Compartido en X correctamente', 'success');
                        }).catch((error) => {
                            console.error('Error sharing:', error);
                            // Fallback a URL de Twitter
                            this.shareToTwitterFallback();
                        });
                    } else {
                        // Fallback si no se puede compartir archivos
                        this.shareToTwitterFallback();
                    }
                })
                .catch(error => {
                    console.error('Error processing image:', error);
                    this.shareToTwitterFallback();
                });
        } else {
            // Fallback para navegadores que no soportan Web Share API
            this.shareToTwitterFallback();
        }
    }

    shareToTwitterFallback() {
        const text = encodeURIComponent('Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify');
        const url = encodeURIComponent('https://cedenofofo.github.io/spotify-playlist');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitterUrl, '_blank');
        this.showNotification('Redirigiendo a X...', 'success');
    }

    shareToFacebook(imageDataUrl) {
        // Para Facebook, redirigir a la app/página con la imagen lista
        if (navigator.share && navigator.canShare) {
            this.prepareAndShareImage(imageDataUrl, 'facebook');
        } else {
            // Redirigir a Facebook Stories
            this.redirectToFacebookStories(imageDataUrl);
        }
    }

    shareToInstagram(imageDataUrl) {
        // Para Instagram, redirigir a la app/página con la imagen lista
        if (navigator.share && navigator.canShare) {
            this.prepareAndShareImage(imageDataUrl, 'instagram');
        } else {
            // Redirigir a Instagram Stories
            this.redirectToInstagramStories(imageDataUrl);
        }
    }

    async prepareAndShareImage(imageDataUrl, platform) {
        try {
            // Convertir la imagen a Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'estadisticas-spotify.png', { type: 'image/png' });
            
            // Verificar si se puede compartir archivos
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Mis Estadísticas de Spotify',
                    text: 'Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify',
                    files: [file]
                });
                this.showNotification(`Compartiendo en ${platform === 'facebook' ? 'Facebook' : 'Instagram'}...`, 'success');
            } else {
                // Si no se puede compartir archivos, copiar al portapapeles
                this.copyImageToClipboard(imageDataUrl);
                if (platform === 'facebook') {
                    this.showFacebookInstructions();
                } else {
                    this.showInstagramInstructions();
                }
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            // Fallback: copiar al portapapeles
            this.copyImageToClipboard(imageDataUrl);
            if (platform === 'facebook') {
                this.showFacebookInstructions();
            } else {
                this.showInstagramInstructions();
            }
        }
    }

    async copyImageToClipboard(imageDataUrl) {
        try {
            // Convertir la imagen a Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            // Crear un ClipboardItem
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob
            });
            
            // Copiar al portapapeles
            await navigator.clipboard.write([clipboardItem]);
            this.showNotification('Imagen copiada al portapapeles', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            // Fallback: descargar la imagen
            this.downloadImage(imageDataUrl);
            this.showNotification('Imagen descargada como fallback', 'info');
        }
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

    showFacebookInstructions() {
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
            border-radius: 15px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        content.innerHTML = `
            <h3 style="color: #1877f2; margin-bottom: 1rem;">📘 Compartir en Facebook</h3>
            <p style="margin-bottom: 1rem; color: #333;">
                La imagen ya está lista en tu portapapeles. Para compartir en Facebook:
            </p>
            <ol style="text-align: left; color: #333; margin-bottom: 1.5rem;">
                <li>Abre la app de Facebook</li>
                <li>Ve a "Crear historia"</li>
                <li>Pega la imagen desde tu portapapeles</li>
                <li>Agrega el texto: "Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify"</li>
                <li>Publica tu historia</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #1877f2;
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">Entendido</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);
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
            border-radius: 15px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        content.innerHTML = `
            <h3 style="color: #e4405f; margin-bottom: 1rem;">📷 Compartir en Instagram</h3>
            <p style="margin-bottom: 1rem; color: #333;">
                La imagen ya está lista en tu portapapeles. Para compartir en Instagram:
            </p>
            <ol style="text-align: left; color: #333; margin-bottom: 1.5rem;">
                <li>Abre la app de Instagram</li>
                <li>Ve a "Crear historia"</li>
                <li>Pega la imagen desde tu portapapeles</li>
                <li>Agrega el texto: "Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify"</li>
                <li>Publica tu historia</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
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

    redirectToFacebookStories(imageDataUrl) {
        // Intentar abrir la app de Facebook Stories
        const facebookStoriesUrl = 'fb://stories';
        const facebookWebUrl = 'https://www.facebook.com/stories/create';
        
        // Primero intentar abrir la app
        window.location.href = facebookStoriesUrl;
        
        // Fallback después de un tiempo si no se abre la app
        setTimeout(() => {
            // Si no se abrió la app, abrir en web
            window.open(facebookWebUrl, '_blank');
        }, 1000);
        
        // Copiar la imagen al portapapeles para que esté lista
        this.copyImageToClipboard(imageDataUrl);
        this.showNotification('Redirigiendo a Facebook Stories...', 'success');
    }

    redirectToInstagramStories(imageDataUrl) {
        // Intentar abrir la app de Instagram Stories
        const instagramStoriesUrl = 'instagram://stories';
        const instagramWebUrl = 'https://www.instagram.com/stories/create';
        
        // Primero intentar abrir la app
        window.location.href = instagramStoriesUrl;
        
        // Fallback después de un tiempo si no se abre la app
        setTimeout(() => {
            // Si no se abrió la app, abrir en web
            window.open(instagramWebUrl, '_blank');
        }, 1000);
        
        // Copiar la imagen al portapapeles para que esté lista
        this.copyImageToClipboard(imageDataUrl);
        this.showNotification('Redirigiendo a Instagram Stories...', 'success');
    }
}