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
        
        // Crear gradiente de fondo mejorado
        this.createEnhancedBackground();
        
        // Agregar header con logo
        this.drawEnhancedHeader();
        
        // Agregar estadísticas principales con mejor diseño
        await this.drawEnhancedMainStats();
        
        // Agregar gráficos mejorados
        this.drawEnhancedCharts();
        
        // Agregar footer mejorado
        this.drawEnhancedFooter();
        
        return this.canvas.toDataURL('image/png');
    }

    createEnhancedBackground() {
        // Gradiente de fondo mejorado
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.3, '#1a1a2e');
        gradient.addColorStop(0.7, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Agregar patrón de estrellas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 2 + 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Agregar líneas decorativas
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = 200 + i * 300;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawEnhancedHeader() {
        // Logo/Título principal con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.5, '#00cfff');
        gradient.addColorStop(1, '#1db954');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 56px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Mis Estadísticas', this.canvas.width / 2, 140);
        
        // Subtítulo con mejor diseño
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Tuneuptify', this.canvas.width / 2, 180);
        
        // Línea decorativa mejorada
        this.ctx.strokeStyle = '#1db954';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2 - 120, 200);
        this.ctx.lineTo(this.canvas.width / 2 + 120, 200);
        this.ctx.stroke();
        
        // Círculos decorativos
        this.ctx.fillStyle = 'rgba(29, 185, 84, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2 - 130, 200, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2 + 130, 200, 8, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    async drawEnhancedMainStats() {
        const startY = 280;
        const cardHeight = 140;
        const cardSpacing = 25;
        
        // Layout de 2 columnas
        const leftColumn = 60;
        const rightColumn = this.canvas.width / 2 + 30;
        const cardWidth = (this.canvas.width - 180) / 2;
        
        // Tiempo de escucha (centrado arriba)
        if (this.statsData.listeningTime) {
            await this.drawEnhancedStatCard('⏰ Tiempo de Escucha', this.statsData.listeningTime, startY, this.canvas.width / 2 - cardWidth / 2, cardWidth);
        }
        
        // Top 5 Artistas (izquierda)
        if (this.statsData.topArtists && this.statsData.topArtists.items.length > 0) {
            const topArtists = this.statsData.topArtists.items.slice(0, 5).map((artist, index) => 
                `${index + 1}. ${artist.name}`
            ).join('\n');
            await this.drawEnhancedStatCard('🎤 Top 5 Artistas', topArtists, startY + cardHeight + cardSpacing, leftColumn, cardWidth);
        }
        
        // Top 5 Canciones (derecha)
        if (this.statsData.topTracks && this.statsData.topTracks.items.length > 0) {
            const topTracks = this.statsData.topTracks.items.slice(0, 5).map((track, index) => 
                `${index + 1}. ${track.name} - ${track.artists[0].name}`
            ).join('\n');
            await this.drawEnhancedStatCard('🎵 Top 5 Canciones', topTracks, startY + cardHeight + cardSpacing, rightColumn, cardWidth);
        }
        
        // Top 3 Géneros (izquierda)
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const topGenres = this.statsData.genres.slice(0, 3).map((genre, index) => 
                `${index + 1}. ${genre.name}`
            ).join('\n');
            this.drawEnhancedStatCard('🎼 Top 3 Géneros', topGenres, startY + (cardHeight + cardSpacing) * 2, leftColumn, cardWidth);
        }
        
        // Top 3 Estados de ánimo (derecha)
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const topMoods = this.statsData.moods.slice(0, 3).map((mood, index) => 
                `${index + 1}. ${mood.name}`
            ).join('\n');
            this.drawEnhancedStatCard('💫 Top 3 Estados de Ánimo', topMoods, startY + (cardHeight + cardSpacing) * 2, rightColumn, cardWidth);
        }
    }

    async drawEnhancedStatCard(title, value, y, x, cardWidth) {
        const cardHeight = 120;
        
        // Fondo de la tarjeta con gradiente
        const gradient = this.ctx.createLinearGradient(x, y, x, y + cardHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.roundRect(x, y, cardWidth, cardHeight, 20);
        this.ctx.fill();
        
        // Borde con gradiente
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Sombra interna
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(x + 2, y + 2, cardWidth - 4, cardHeight - 4);
        
        // Título con mejor diseño
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 15, y + 30);
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + 40);
        this.ctx.lineTo(x + cardWidth - 15, y + 40);
        this.ctx.stroke();
        
        // Valor con mejor formato
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 16px Inter, sans-serif';
        
        // Dividir el texto en líneas si es necesario
        const lines = value.split('\n');
        lines.forEach((line, index) => {
            this.ctx.fillText(line, x + 15, y + 60 + (index * 20));
        });
    }

    drawEnhancedCharts() {
        const startY = 1000;
        
        // Gráfico de géneros mejorado
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            this.drawEnhancedGenreChart(startY);
        }
        
        // Gráfico de mood mejorado
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            this.drawEnhancedMoodChart(startY + 200);
        }
    }

    drawEnhancedGenreChart(startY) {
        // Título con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(1, '#00cfff');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎼 Géneros Favoritos', this.canvas.width / 2, startY);
        
        const genres = this.statsData.genres.slice(0, 3);
        const barHeight = 40;
        const barSpacing = 15;
        const startX = 80;
        const maxWidth = this.canvas.width - 160;
        
        genres.forEach((genre, index) => {
            const y = startY + 60 + (barHeight + barSpacing) * index;
            const width = (genre.count / genres[0].count) * maxWidth;
            
            // Fondo de la barra con gradiente
            const barGradient = this.ctx.createLinearGradient(startX, y, startX + maxWidth, y);
            barGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            barGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            this.ctx.fillStyle = barGradient;
            this.ctx.roundRect(startX, y, maxWidth, barHeight, 8);
            this.ctx.fill();
            
            // Barra de progreso con gradiente
            const progressGradient = this.ctx.createLinearGradient(startX, y, startX + width, y);
            progressGradient.addColorStop(0, '#1db954');
            progressGradient.addColorStop(1, '#00cfff');
            this.ctx.fillStyle = progressGradient;
            this.ctx.roundRect(startX, y, width, barHeight, 8);
            this.ctx.fill();
            
            // Texto del género
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 18px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(genre.name, startX + 15, y + 25);
            
            // Porcentaje
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${Math.round((genre.count / genres[0].count) * 100)}%`, startX + maxWidth - 15, y + 25);
        });
    }

    drawEnhancedMoodChart(startY) {
        // Título con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(1, '#ff8e53');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💫 Estados de Ánimo', this.canvas.width / 2, startY);
        
        const moods = this.statsData.moods.slice(0, 3);
        const barHeight = 35;
        const barSpacing = 12;
        const startX = 80;
        const maxWidth = this.canvas.width - 160;
        
        moods.forEach((mood, index) => {
            const y = startY + 60 + (barHeight + barSpacing) * index;
            const maxCount = Math.max(...moods.map(m => m.count));
            const width = (mood.count / maxCount) * maxWidth;
            
            // Fondo de la barra con gradiente
            const barGradient = this.ctx.createLinearGradient(startX, y, startX + maxWidth, y);
            barGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            barGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            this.ctx.fillStyle = barGradient;
            this.ctx.roundRect(startX, y, maxWidth, barHeight, 8);
            this.ctx.fill();
            
            // Barra de progreso con gradiente
            const progressGradient = this.ctx.createLinearGradient(startX, y, startX + width, y);
            progressGradient.addColorStop(0, '#ff6b35');
            progressGradient.addColorStop(1, '#ff8e53');
            this.ctx.fillStyle = progressGradient;
            this.ctx.roundRect(startX, y, width, barHeight, 8);
            this.ctx.fill();
            
            // Texto del mood
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(mood.name, startX + 15, y + 22);
            
            // Porcentaje
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${Math.round((mood.count / maxCount) * 100)}%`, startX + maxWidth - 15, y + 22);
        });
    }

    drawEnhancedFooter() {
        const footerY = this.canvas.height - 120;
        
        // Fondo del footer con gradiente
        const footerGradient = this.ctx.createLinearGradient(0, footerY, 0, this.canvas.height);
        footerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        footerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        this.ctx.fillStyle = footerGradient;
        this.ctx.fillRect(0, footerY, this.canvas.width, this.canvas.height - footerY);
        
        // Línea separadora con gradiente
        const lineGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        lineGradient.addColorStop(0, 'transparent');
        lineGradient.addColorStop(0.3, '#1db954');
        lineGradient.addColorStop(0.7, '#00cfff');
        lineGradient.addColorStop(1, 'transparent');
        
        this.ctx.strokeStyle = lineGradient;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(50, footerY);
        this.ctx.lineTo(this.canvas.width - 50, footerY);
        this.ctx.stroke();
        
        // Logo con gradiente
        const logoGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        logoGradient.addColorStop(0, '#1db954');
        logoGradient.addColorStop(0.5, '#00cfff');
        logoGradient.addColorStop(1, '#1db954');
        
        this.ctx.fillStyle = logoGradient;
        this.ctx.font = 'bold 28px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Tuneuptify', this.canvas.width / 2, footerY + 35);
        
        // URL con mejor diseño
        this.ctx.font = 'bold 16px Inter, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('tuneuptify.com', this.canvas.width / 2, footerY + 60);
        
        // Texto adicional
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillText('Descubre tu música', this.canvas.width / 2, footerY + 85);
        
        // QR Code mejorado
        this.drawEnhancedQRCode(this.canvas.width - 80, footerY + 10);
    }

    drawEnhancedQRCode(x, y) {
        const size = 70;
        
        // Fondo del QR con gradiente
        const qrGradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        qrGradient.addColorStop(0, 'rgba(29, 185, 84, 0.2)');
        qrGradient.addColorStop(1, 'rgba(0, 207, 255, 0.2)');
        this.ctx.fillStyle = qrGradient;
        this.ctx.roundRect(x, y, size, size, 12);
        this.ctx.fill();
        
        // Borde con gradiente
        this.ctx.strokeStyle = 'rgba(29, 185, 84, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Logo en el centro
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵', x + size / 2, y + size / 2 + 8);
        
        // Texto debajo
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 10px Inter, sans-serif';
        this.ctx.fillText('ESCANEA', x + size / 2, y + size + 15);
    }

    async shareToSocialMedia(imageDataUrl, platform) {
        const shareData = {
            title: 'Mis Estadísticas de Spotify',
            text: '¡Mira mis estadísticas musicales generadas con Tuneuptify!',
            url: 'https://cedenofofo.github.io/spotify-playlist/'
        };

        switch (platform) {
            case 'twitter':
                return this.shareToTwitter(shareData);
            case 'instagram':
                return this.shareToInstagram(imageDataUrl);
            case 'facebook':
                return this.shareToFacebook(shareData);
            case 'download':
                return this.downloadImage(imageDataUrl);
            default:
                return this.shareNative(shareData);
        }
    }

    shareToTwitter(shareData) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank');
    }

    shareToFacebook(shareData) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank');
    }

    shareToInstagram(imageDataUrl) {
        // Instagram no permite compartir directamente desde web
        // Mostrar instrucciones al usuario
        this.showInstagramInstructions(imageDataUrl);
    }

    downloadImage(imageDataUrl) {
        const link = document.createElement('a');
        link.download = `spotify-stats-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    shareNative(shareData) {
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback para navegadores que no soportan Web Share API
            this.showShareModal(shareData);
        }
    }

    showInstagramInstructions(imageDataUrl) {
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
        `;

        content.innerHTML = `
            <h3>📱 Compartir en Instagram</h3>
            <p>Para compartir en Instagram:</p>
            <ol style="text-align: left;">
                <li>Descarga la imagen</li>
                <li>Abre Instagram</li>
                <li>Sube la imagen como historia</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #1db954;
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
    }

    showShareModal(shareData) {
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
        `;

        content.innerHTML = `
            <h3>📤 Compartir Estadísticas</h3>
            <p>Enlace para compartir:</p>
            <input type="text" value="${shareData.url}" readonly style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                margin: 10px 0;
            ">
            <button onclick="navigator.clipboard.writeText('${shareData.url}')" style="
                background: #1db954;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                margin: 5px;
            ">Copiar Enlace</button>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #666;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                margin: 5px;
            ">Cerrar</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);
    }
}

// Extender el prototipo de CanvasRenderingContext2D para roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
} 