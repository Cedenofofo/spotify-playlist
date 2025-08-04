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
        
        // Crear gradiente de fondo
        this.createBackground();
        
        // Agregar header con logo
        this.drawHeader();
        
        // Agregar estadísticas principales
        await this.drawMainStats();
        
        // Agregar gráficos
        this.drawCharts();
        
        // Agregar footer
        this.drawFooter();
        
        return this.canvas.toDataURL('image/png');
    }

    createBackground() {
        // Gradiente de fondo
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Agregar patrón de puntos
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    drawHeader() {
        // Título principal
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Mis Estadísticas', this.canvas.width / 2, 120);
        
        // Subtítulo
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('Tuneuptify', this.canvas.width / 2, 160);
        
        // Línea decorativa
        this.ctx.strokeStyle = '#1db954';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2 - 100, 180);
        this.ctx.lineTo(this.canvas.width / 2 + 100, 180);
        this.ctx.stroke();
    }

    async drawMainStats() {
        const startY = 250;
        const cardHeight = 120;
        const cardSpacing = 20;
        
        // Tiempo de escucha
        if (this.statsData.listeningTime) {
            await this.drawStatCard('⏰ Tiempo de Escucha', this.statsData.listeningTime, startY);
        }
        
        // Top 10 Artistas
        if (this.statsData.topArtists && this.statsData.topArtists.items.length > 0) {
            const topArtists = this.statsData.topArtists.items.slice(0, 10).map((artist, index) => 
                `${index + 1}. ${artist.name}`
            ).join('\n');
            await this.drawStatCard('🎤 Top 10 Artistas', topArtists, startY + cardHeight + cardSpacing);
        }
        
        // Top 10 Canciones
        if (this.statsData.topTracks && this.statsData.topTracks.items.length > 0) {
            const topTracks = this.statsData.topTracks.items.slice(0, 10).map((track, index) => 
                `${index + 1}. ${track.name} - ${track.artists[0].name}`
            ).join('\n');
            await this.drawStatCard('🎵 Top 10 Canciones', topTracks, startY + (cardHeight + cardSpacing) * 2);
        }
        
        // Top 3 Géneros
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            const topGenres = this.statsData.genres.slice(0, 3).map((genre, index) => 
                `${index + 1}. ${genre.name}`
            ).join('\n');
            this.drawStatCard('🎼 Top 3 Géneros', topGenres, startY + (cardHeight + cardSpacing) * 3);
        }
        
        // Top 3 Estados de ánimo
        if (this.statsData.moods && this.statsData.moods.length > 0) {
            const topMoods = this.statsData.moods.slice(0, 3).map((mood, index) => 
                `${index + 1}. ${mood.name}`
            ).join('\n');
            this.drawStatCard('💫 Top 3 Estados de Ánimo', topMoods, startY + (cardHeight + cardSpacing) * 4);
        }
    }

    async drawStatCard(title, value, y) {
        const cardWidth = this.canvas.width - 80;
        const cardHeight = 100;
        const x = 40;
        
        // Fondo de la tarjeta
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.roundRect(x, y, cardWidth, cardHeight, 15);
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 20, y + 30);
        
        // Valor
        this.ctx.fillStyle = '#1db954';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.fillText(value, x + 20, y + 65);
    }

    drawCharts() {
        const startY = 800;
        
        // Gráfico de géneros
        if (this.statsData.genres && this.statsData.genres.length > 0) {
            this.drawGenreChart(startY);
        }
        
        // Gráfico de mood
        if (this.statsData.moodAnalysis) {
            this.drawMoodChart(startY + 300);
        }
    }

    drawGenreChart(startY) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Géneros Favoritos', this.canvas.width / 2, startY);
        
        const genres = this.statsData.genres.slice(0, 5);
        const barHeight = 30;
        const barSpacing = 10;
        const startX = 100;
        const maxWidth = this.canvas.width - 200;
        
        genres.forEach((genre, index) => {
            const y = startY + 50 + (barHeight + barSpacing) * index;
            const width = (genre.count / genres[0].count) * maxWidth;
            
            // Barra de fondo
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(startX, y, maxWidth, barHeight);
            
            // Barra de progreso
            this.ctx.fillStyle = '#1db954';
            this.ctx.fillRect(startX, y, width, barHeight);
            
            // Texto del género
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(genre.name, startX + 10, y + 20);
            
            // Porcentaje
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${Math.round((genre.count / genres[0].count) * 100)}%`, startX + maxWidth - 10, y + 20);
        });
    }

    drawMoodChart(startY) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Estado de Ánimo Musical', this.canvas.width / 2, startY);
        
        const moods = this.statsData.moodAnalysis;
        const barHeight = 25;
        const barSpacing = 8;
        const startX = 100;
        const maxWidth = this.canvas.width - 200;
        
        Object.entries(moods).forEach(([mood, percentage], index) => {
            const y = startY + 50 + (barHeight + barSpacing) * index;
            const width = (percentage / 100) * maxWidth;
            
            // Barra de fondo
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(startX, y, maxWidth, barHeight);
            
            // Barra de progreso
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillRect(startX, y, width, barHeight);
            
            // Texto del mood
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(mood, startX + 10, y + 17);
            
            // Porcentaje
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${percentage}%`, startX + maxWidth - 10, y + 17);
        });
    }

    drawFooter() {
        const footerY = this.canvas.height - 150;
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(50, footerY);
        this.ctx.lineTo(this.canvas.width - 50, footerY);
        this.ctx.stroke();
        
        // Texto del footer
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '18px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Generado con Tuneuptify', this.canvas.width / 2, footerY + 40);
        
        // Fecha
        const date = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.ctx.fillText(date, this.canvas.width / 2, footerY + 70);
        
        // QR Code placeholder
        this.drawQRCode(this.canvas.width - 100, footerY - 80);
    }

    drawQRCode(x, y) {
        // Placeholder para QR code
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, 60, 60);
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, 60, 60);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('QR', x + 30, y + 35);
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