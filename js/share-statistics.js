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
        const startY = 450;
        
        // Título de artistas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎤 Top 3 Artistas', this.canvas.width / 2, startY);
        
        // Top 3 Artistas
        if (this.statsData.topArtists?.items) {
            const artists = this.statsData.topArtists.items.slice(0, 3);
            artists.forEach((artist, index) => {
                const y = startY + 60 + (index * 70);
                this.drawModernArtistItem(artist, index + 1, y);
            });
        }
        
        // Título de canciones - espaciado uniforme
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Top 3 Canciones', this.canvas.width / 2, startY + 350); // Espaciado uniforme
        
        // Top 3 Canciones
        if (this.statsData.topTracks?.items) {
            const tracks = this.statsData.topTracks.items.slice(0, 3);
            tracks.forEach((track, index) => {
                const y = startY + 410 + (index * 70); // Espaciado uniforme
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
        const startY = 1200; // Espaciado uniforme desde canciones
        
        // Título de géneros
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎼 Top 3 Géneros', this.canvas.width / 2, startY);
        
        // Top 3 Géneros
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const genres = this.statsData.genres.slice(0, 3);
            genres.forEach((genre, index) => {
                const y = startY + 50 + (index * 60);
                this.drawModernGenreItem(genre, index + 1, y);
            });
        }
        
        // Título de mood - espaciado uniforme
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💫 Top 3 Estados de Ánimo', this.canvas.width / 2, startY + 350); // Espaciado uniforme
        
        // Top 3 Estados de ánimo
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const moods = this.statsData.moods.slice(0, 3);
            moods.forEach((mood, index) => {
                const y = startY + 400 + (index * 60); // Espaciado uniforme
                this.drawModernMoodItem(mood, index + 1, y);
            });
        }
        
        // Métricas adicionales - espaciado uniforme
        this.drawAdditionalMetrics(startY + 650); // Espaciado uniforme
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
        // Para Twitter/X, crear tweet con texto + link + imagen
        this.createTwitterTweet(imageDataUrl);
    }

    async createTwitterTweet(imageDataUrl) {
        try {
            // Convertir la imagen a Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'estadisticas-spotify.png', { type: 'image/png' });
            
            // Verificar si se puede compartir archivos
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const shareData = {
                    title: 'Mis Estadísticas de Spotify',
                    text: 'Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify https://cedenofofo.github.io/spotify-playlist',
                    files: [file]
                };
                
                await navigator.share(shareData);
                this.showNotification('Compartiendo en X...', 'success');
            } else {
                // Fallback: abrir Twitter con texto + link
                const text = encodeURIComponent('Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify');
                const url = encodeURIComponent('https://cedenofofo.github.io/spotify-playlist');
                const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                window.open(twitterUrl, '_blank');
                this.showNotification('Redirigiendo a X...', 'success');
            }
        } catch (error) {
            console.error('Error sharing to Twitter:', error);
            // Fallback: abrir Twitter con texto + link
            const text = encodeURIComponent('Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify');
            const url = encodeURIComponent('https://cedenofofo.github.io/spotify-playlist');
            const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            window.open(twitterUrl, '_blank');
            this.showNotification('Redirigiendo a X...', 'success');
        }
    }

    shareToFacebook(imageDataUrl) {
        // Para Facebook, usar Web Share API con imagen
        this.shareToSocialApp(imageDataUrl, 'facebook');
    }

    async shareToInstagram(imageDataUrl) {
        try {
            // Convertir la imagen a Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'estadisticas-spotify.png', { type: 'image/png' });
            
            // Intentar usar Web Share API con archivos para Instagram Stories
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const shareData = {
                    title: 'Mis Estadísticas de Spotify',
                    text: 'Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify',
                    files: [file]
                };
                
                await navigator.share(shareData);
                this.showNotification('Compartiendo en Instagram Stories...', 'success');
            } else {
                // Intentar método alternativo con Instagram API
                await this.tryInstagramStoriesDirectShare(imageDataUrl);
            }
        } catch (error) {
            console.error('Error sharing to Instagram:', error);
            // Fallback: intentar abrir Instagram Stories directamente
            await this.tryInstagramStoriesDirectShare(imageDataUrl);
        }
    }

    async tryInstagramDirectShare(imageDataUrl) {
        try {
            // Intentar usar el esquema de Instagram para compartir archivos
            const instagramShareUrl = `instagram://library?AssetPickerSourceType=1&LocalIdentifier=${encodeURIComponent(imageDataUrl)}`;
            
            // Crear un enlace temporal para descargar la imagen
            const link = document.createElement('a');
            link.download = 'estadisticas-spotify.png';
            link.href = imageDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Intentar abrir Instagram con el esquema de compartir
            window.location.href = instagramShareUrl;
            
            // Fallback después de 1 segundo
            setTimeout(() => {
                this.openInstagramStoriesDirectly(imageDataUrl);
            }, 1000);
            
            this.showNotification('Abriendo Instagram para compartir...', 'success');
        } catch (error) {
            console.error('Error with Instagram direct share:', error);
            this.openInstagramStoriesDirectly(imageDataUrl);
        }
    }

    // Función adicional para intentar compartir directamente con Instagram Stories
    async tryInstagramStoriesDirectShare(imageDataUrl) {
        try {
            // Convertir la imagen a base64 para intentar pasarla directamente
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            // Crear un enlace temporal para descargar la imagen
            const link = document.createElement('a');
            link.download = 'estadisticas-spotify.png';
            link.href = imageDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Intentar múltiples esquemas de Instagram Stories
            const schemes = [
                'instagram://stories/create',
                'instagram://stories',
                'instagram://library?AssetPickerSourceType=1&MediaType=1',
                'instagram://library?AssetPickerSourceType=1'
            ];
            
            let opened = false;
            
            for (let i = 0; i < schemes.length; i++) {
                if (!opened) {
                    try {
                        window.location.href = schemes[i];
                        opened = true;
                        this.showNotification(`Intentando método ${i + 1}...`, 'info');
                    } catch (error) {
                        console.log(`Método ${i + 1} falló`);
                    }
                }
                
                // Esperar un poco antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Si ningún esquema funcionó, mostrar instrucciones
            if (!opened) {
                this.showInstagramInstructions();
            }
            
        } catch (error) {
            console.error('Error with Instagram Stories direct share:', error);
            this.showInstagramInstructions();
        }
    }

    openInstagramStoriesDirectly(imageDataUrl) {
        // Intentar múltiples métodos para abrir Instagram Stories
        
        // Método 1: Intentar abrir Instagram Stories directamente
        const instagramStoriesUrl = 'instagram://stories';
        
        // Método 2: Intentar con parámetros específicos para stories
        const instagramStoriesWithParams = 'instagram://stories/create';
        
        // Método 3: Intentar con el esquema de Instagram para compartir
        const instagramShareUrl = 'instagram://library?AssetPickerSourceType=1';
        
        // Método 4: Intentar con el esquema específico para stories con imagen
        const instagramStoriesWithImage = `instagram://stories/create?image=${encodeURIComponent(imageDataUrl)}`;
        
        // Método 5: Intentar con el esquema de Instagram para compartir archivos
        const instagramFileShare = 'instagram://library?AssetPickerSourceType=1&MediaType=1';
        
        // Crear un enlace temporal para descargar la imagen
        const link = document.createElement('a');
        link.download = 'estadisticas-spotify.png';
        link.href = imageDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar instrucciones al usuario
        this.showInstagramInstructions();
        
        // Intentar abrir Instagram con diferentes URLs
        let opened = false;
        
        // Intentar con el primer método
        try {
            window.location.href = instagramStoriesUrl;
            opened = true;
        } catch (error) {
            console.log('Primer método falló, intentando segundo...');
        }
        
        // Si el primer método no funciona, intentar el segundo
        setTimeout(() => {
            if (!opened) {
                try {
                    window.location.href = instagramStoriesWithParams;
                    opened = true;
                } catch (error) {
                    console.log('Segundo método falló, intentando tercero...');
                }
            }
        }, 500);
        
        // Si los métodos anteriores no funcionan, intentar el tercero
        setTimeout(() => {
            if (!opened) {
                try {
                    window.location.href = instagramShareUrl;
                    opened = true;
                } catch (error) {
                    console.log('Tercer método falló, intentando cuarto...');
                }
            }
        }, 1000);
        
        // Si los métodos anteriores no funcionan, intentar el cuarto
        setTimeout(() => {
            if (!opened) {
                try {
                    window.location.href = instagramStoriesWithImage;
                    opened = true;
                } catch (error) {
                    console.log('Cuarto método falló, intentando quinto...');
                }
            }
        }, 1500);
        
        // Si los métodos anteriores no funcionan, intentar el quinto
        setTimeout(() => {
            if (!opened) {
                try {
                    window.location.href = instagramFileShare;
                    opened = true;
                } catch (error) {
                    console.log('Quinto método falló, usando fallback web...');
                }
            }
        }, 2000);
        
        // Fallback final a web después de 3 segundos
        setTimeout(() => {
            if (!opened) {
                window.open('https://www.instagram.com/stories/create', '_blank');
            }
        }, 3000);
        
        this.showNotification('Abriendo Instagram Stories...', 'success');
    }

    showInstagramInstructions() {
        // Crear un modal con instrucciones para el usuario
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 450px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="color: #1db954; margin-bottom: 1rem;">📱 Subir a Instagram Stories</h3>
                <p style="margin-bottom: 1rem; color: #333;">
                    La imagen se ha descargado automáticamente. Para subirla a tus historias:
                </p>
                <ol style="text-align: left; color: #666; margin-bottom: 1.5rem; line-height: 1.6;">
                    <li><strong>Abre Instagram</strong> en tu dispositivo</li>
                    <li><strong>Ve a "Crear historia"</strong> (botón + en la parte superior)</li>
                    <li><strong>Selecciona la imagen</strong> descargada desde tu galería</li>
                    <li><strong>Personaliza</strong> con stickers, texto o filtros si quieres</li>
                    <li><strong>¡Comparte tu estadística!</strong> 🎵</li>
                </ol>
                <div style="
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    border-left: 4px solid #1db954;
                ">
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        <strong>💡 Tip:</strong> La imagen se guardó como "estadisticas-spotify.png" en tu carpeta de descargas.
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #1db954;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#1ed760'" onmouseout="this.style.background='#1db954'">
                    ¡Entendido!
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 15 segundos
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 15000);
    }

    async shareToSocialApp(imageDataUrl, platform) {
        try {
            // Convertir la imagen a Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'estadisticas-spotify.png', { type: 'image/png' });
            
            // Verificar si se puede compartir archivos
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const shareData = {
                    title: 'Mis Estadísticas de Spotify',
                    text: 'Descubrí tus estadísticas de Spotify y gestiona tus playlist con Tuneuptify',
                    files: [file]
                };
                
                await navigator.share(shareData);
                this.showNotification(`Compartiendo en ${platform}...`, 'success');
            } else {
                // Fallback: descargar imagen y abrir app nativa
                this.downloadImage(imageDataUrl);
                this.openNativeApp(platform);
            }
        } catch (error) {
            console.error(`Error sharing to ${platform}:`, error);
            // Fallback: descargar imagen y abrir app nativa
            this.downloadImage(imageDataUrl);
            this.openNativeApp(platform);
        }
    }

    openNativeApp(platform) {
        const appUrls = {
            twitter: {
                app: 'twitter://post',
                web: 'https://twitter.com/intent/tweet?text=Descubrí%20tus%20estadísticas%20de%20Spotify%20y%20gestiona%20tus%20playlist%20con%20Tuneuptify'
            },
            facebook: {
                app: 'fb://stories',
                web: 'https://www.facebook.com/stories/create'
            },
            instagram: {
                app: 'instagram://stories',
                web: 'https://www.instagram.com/stories/create'
            }
        };

        const urls = appUrls[platform];
        if (!urls) return;

        // Intentar abrir app nativa
        window.location.href = urls.app;
        
        // Fallback a web después de 1 segundo
        setTimeout(() => {
            window.open(urls.web, '_blank');
        }, 1000);

        this.showNotification(`Abriendo ${platform}...`, 'success');
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
                // Si no se puede compartir archivos, abrir la app
                this.openSocialApp(platform, imageDataUrl);
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            // Fallback: abrir la app
            this.openSocialApp(platform, imageDataUrl);
        }
    }

    async copyImageToClipboard(imageDataUrl) {
        // Función eliminada - ya no se usa portapapeles
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
        // Función eliminada - ya no se necesitan instrucciones
    }

    showInstagramInstructions() {
        // Función eliminada - ya no se necesitan instrucciones
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    redirectToFacebookStories(imageDataUrl) {
        // Función eliminada - ahora usa shareToSocialApp
    }

    redirectToInstagramStories(imageDataUrl) {
        // Función eliminada - ahora usa shareToSocialApp
    }
}