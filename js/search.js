class SearchManager {
    constructor() {
        console.log('🚀 SearchManager v1.0.2 constructor iniciado');
        this.config = window.config;
        console.log('Config cargado:', this.config ? 'Sí' : 'No');
        this.auth = new Auth();
        console.log('Auth inicializado');
        this.setupEventListeners();
        console.log('✅ SearchManager v1.0.2 inicializado correctamente');
        
        // Verificar si hay canciones seleccionadas al inicializar
        this.checkSelectedTracks();
        
        // Inicializar mejoras visuales
        this.initVisualEnhancements();
        
        // Hacer el manager globalmente disponible
        window.searchManager = this;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('track-search');
        const suggestionsDiv = document.getElementById('search-suggestions');
        
        if (searchInput && suggestionsDiv) {
            console.log('Configurando event listeners para búsqueda de canciones');
            console.log('Search input encontrado:', searchInput);
            console.log('Suggestions div encontrado:', suggestionsDiv);
            let debounceTimeout;
            
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim();
                console.log('Input event triggered, query:', query);
                if (query.length < 1) {
                    this.hideSuggestions(suggestionsDiv);
                    return;
                }
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => this.searchTracks(query, suggestionsDiv, searchInput), 300);
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.hideSuggestions(suggestionsDiv);
                }, 200);
            });
            
            // Agregar efecto de focus mejorado
            searchInput.addEventListener('focus', () => {
                searchInput.style.transform = 'scale(1.02)';
                searchInput.style.boxShadow = '0 0 0 3px rgba(29, 185, 84, 0.2)';
            });
            
            searchInput.addEventListener('blur', () => {
                searchInput.style.transform = 'scale(1)';
                searchInput.style.boxShadow = 'none';
            });
        } else {
            console.warn('No se encontraron elementos para búsqueda de canciones');
            console.error('searchInput:', searchInput);
            console.error('suggestionsDiv:', suggestionsDiv);
        }
    }

    initVisualEnhancements() {
        // Agregar efectos visuales a las sugerencias de búsqueda
        const suggestionsDiv = document.getElementById('search-suggestions');
        if (suggestionsDiv) {
            // Observar cambios en las sugerencias para aplicar efectos
            const observer = new MutationObserver(() => {
                const suggestionElements = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                suggestionElements.forEach((suggestion, index) => {
                    if (!suggestion.dataset.enhanced) {
                        this.enhanceSuggestionElement(suggestion, index);
                        suggestion.dataset.enhanced = 'true';
                    }
                });
            });
            
            observer.observe(suggestionsDiv, { childList: true, subtree: true });
        }
    }

    enhanceSuggestionElement(suggestionElement, index) {
        // Agregar animación de entrada escalonada
        suggestionElement.style.opacity = '0';
        suggestionElement.style.transform = 'translateY(10px)';
        suggestionElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            suggestionElement.style.opacity = '1';
            suggestionElement.style.transform = 'translateY(0)';
        }, index * 50);
        
        // Agregar efectos de hover mejorados
        suggestionElement.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px) scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.15)';
        });
        
        suggestionElement.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    }

    async searchTracks(query, suggestionsDiv, searchInput) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            console.log('Token encontrado:', token ? 'Sí' : 'No');
            if (!token) {
                console.error('No hay token de acceso para búsqueda de canciones');
                suggestionsDiv.innerHTML = '<div class="error">No hay token de acceso</div>';
                return;
            }

            console.log('Buscando canciones:', query);
            console.log('URL de búsqueda:', `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`);
            
            // Mostrar indicador de carga
            suggestionsDiv.innerHTML = '<div class="search-loading"><div class="spinner"></div>Buscando canciones...</div>';
            suggestionsDiv.classList.add('show');
            
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error en la API: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API response data:', data);

            if (data.tracks && data.tracks.items) {
                console.log('Tracks encontrados:', data.tracks.items.length);
                this.displayResults(data.tracks.items, suggestionsDiv, searchInput);
            } else {
                console.log('No se encontraron tracks en la respuesta');
                suggestionsDiv.innerHTML = '<div class="no-results">No se encontraron canciones</div>';
            }
        } catch (error) {
            console.error('Error al buscar canciones:', error);
            suggestionsDiv.innerHTML = '<div class="error">Error al buscar canciones: ' + error.message + '</div>';
        }
    }

    displayResults(tracks, suggestionsDiv, searchInput) {
        suggestionsDiv.innerHTML = '';

        if (tracks.length > 0) {
            // Mostrar sugerencias y agregar espaciado
            suggestionsDiv.style.display = 'block';
            suggestionsDiv.classList.add('show', 'has-suggestions');
            this.updateSearchSpacing();
            
            // Agregar mensaje informativo
            const infoDiv = document.createElement('div');
            infoDiv.className = 'suggestion-info-message';
            infoDiv.innerHTML = '<i class="fas fa-info-circle"></i> Mostrando los 5 mejores resultados';
            suggestionsDiv.appendChild(infoDiv);
        }

        tracks.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'autocomplete-suggestion';
            trackDiv.innerHTML = `
                <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/32?text=🎵'}" alt="${track.album.name}">
                <span>${track.name} <span style="color:#1db954;">${track.artists.map(artist => artist.name).join(', ')}</span></span>
            `;
            
            trackDiv.addEventListener('click', () => {
                this.addTrack(track);
                this.hideSuggestions(suggestionsDiv);
                searchInput.value = '';
                this.updateSearchSpacing();
                
                // Efecto de confirmación
                this.showAddConfirmation(track.name);
            });
            
            suggestionsDiv.appendChild(trackDiv);
        });

        // Mostrar las sugerencias
        if (tracks.length > 0) {
            suggestionsDiv.classList.add('show');
        } else {
            suggestionsDiv.classList.remove('show');
            suggestionsDiv.classList.remove('has-suggestions');
            this.updateSearchSpacing();
        }
    }

    showAddConfirmation(trackName) {
        // Crear notificación temporal de confirmación
        const confirmation = document.createElement('div');
        confirmation.className = 'add-confirmation';
        confirmation.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${trackName} agregada</span>
        `;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.style.animation = 'addConfirmationOut 0.4s ease-in';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 400);
        }, 800); // Reducido de 1000ms a 800ms
    }

    addTrack(track) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        // Verificar si la canción ya está en la lista
        if (selectedTracks.some(t => t.uri === track.uri)) {
            showNotification('Esta canción ya está en la lista', 'warning');
            return;
        }

        // Agregar la canción a la lista
        const trackData = {
            uri: track.uri,
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: {
                name: track.album.name,
                image: track.album.images[0]?.url
            }
        };

        selectedTracks.push(trackData);
        localStorage.setItem('selectedTracks', JSON.stringify(selectedTracks));
        
        this.updateSelectedTracksList();
        showNotification('Canción agregada a la lista', 'success');
        
        // Actualizar automáticamente la vista previa si existe
        this.updatePlaylistPreview();
        
        // Asegurar que la sección de canciones seleccionadas sea visible
        this.ensureSelectedTracksVisible();
        
        // Actualizar el estado del botón de exportar
        this.updateExportButtonState();
    }

    removeTrack(uri) {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        const trackToRemove = selectedTracks.find(track => track.uri === uri);
        
        if (trackToRemove) {
            // Efecto visual de eliminación
            const trackElement = document.querySelector(`[data-uri="${uri}"]`);
            if (trackElement) {
                trackElement.style.transform = 'translateX(100px)';
                trackElement.style.opacity = '0';
                trackElement.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    const updatedTracks = selectedTracks.filter(track => track.uri !== uri);
                    localStorage.setItem('selectedTracks', JSON.stringify(updatedTracks));
                    this.updateSelectedTracksList();
                    showNotification('Canción removida de la lista', 'info');
                    this.updatePlaylistPreview();
                    this.updateExportButtonState();
                }, 300);
            } else {
                const updatedTracks = selectedTracks.filter(track => track.uri !== uri);
                localStorage.setItem('selectedTracks', JSON.stringify(updatedTracks));
                this.updateSelectedTracksList();
                showNotification('Canción removida de la lista', 'info');
                this.updatePlaylistPreview();
                this.updateExportButtonState();
            }
        }
    }

    // Función para manejar sugerencias dinámicamente
    showSuggestions(suggestionsDiv, suggestions) {
        console.log('🎯 showSuggestions called with:', suggestions.length, 'suggestions');
        if (!suggestionsDiv) {
            console.warn('⚠️ suggestionsDiv not found');
            return;
        }
        
        if (suggestions.length === 0) {
            console.log('📭 No suggestions, hiding');
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.remove('show');
            return;
        }
        
        console.log('✨ Showing suggestions and positioning');
        // Mostrar sugerencias
        suggestionsDiv.innerHTML = suggestions;
        suggestionsDiv.classList.add('show');
        
        // Posicionar las sugerencias correctamente
        this.positionSuggestions(suggestionsDiv);
        
        // Ajustar layout dinámicamente
        this.adjustLayoutForSuggestions(suggestionsDiv);
    }
    
    hideSuggestions(suggestionsDiv) {
        if (!suggestionsDiv) return;
        
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.classList.remove('show');
        
        // Restaurar layout
        this.restoreLayout();
    }
    
    positionSuggestions(suggestionsDiv) {
        console.log('📍 Positioning suggestions');
        // Obtener el input asociado
        const input = suggestionsDiv.previousElementSibling;
        if (!input) {
            console.warn('⚠️ Input not found for positioning');
            return;
        }
        
        // Obtener la posición del input
        const inputRect = input.getBoundingClientRect();
        console.log('📐 Input position:', inputRect);
        
        // Posicionar las sugerencias debajo del input
        suggestionsDiv.style.position = 'fixed';
        suggestionsDiv.style.top = (inputRect.bottom + 4) + 'px';
        suggestionsDiv.style.left = inputRect.left + 'px';
        suggestionsDiv.style.width = inputRect.width + 'px';
        suggestionsDiv.style.zIndex = '999999';
        
        console.log('✅ Suggestions positioned at:', {
            top: suggestionsDiv.style.top,
            left: suggestionsDiv.style.left,
            width: suggestionsDiv.style.width
        });
    }
    
    adjustLayoutForSuggestions(suggestionsDiv) {
        // Agregar clase al contenedor padre para ajustar espaciado
        const container = suggestionsDiv.closest('.form-group');
        if (container) {
            container.classList.add('has-active-suggestions');
        }
        
        // Ocultar temporalmente elementos que pueden superponerse
        this.hideOverlappingElements();
    }
    
    hideOverlappingElements() {
        // Elementos que pueden superponerse con las sugerencias
        const overlappingSelectors = [
            '#add-artist',
            '.artist-inputs',
            '#selected-tracks',
            '#preview-playlist',
            '.form-group:has(.autocomplete-container) + .form-group'
        ];
        
        overlappingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0.3';
                element.style.pointerEvents = 'none';
            });
        });
    }
    
    showOverlappingElements() {
        // Restaurar visibilidad de elementos
        const overlappingSelectors = [
            '#add-artist',
            '.artist-inputs',
            '#selected-tracks',
            '#preview-playlist',
            '.form-group:has(.autocomplete-container) + .form-group'
        ];
        
        overlappingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
            });
        });
    }
    
    restoreLayout() {
        // Remover clase de todos los contenedores
        const containers = document.querySelectorAll('.form-group.has-active-suggestions');
        containers.forEach(container => {
            container.classList.remove('has-active-suggestions');
        });
        
        // Restaurar visibilidad de elementos
        this.showOverlappingElements();
    }
    
    ensureSelectedTracksVisible() {
        // Asegurar que la sección de canciones seleccionadas sea visible
        const selectedTracksDiv = document.getElementById('selected-tracks');
        if (selectedTracksDiv) {
            selectedTracksDiv.style.opacity = '1';
            selectedTracksDiv.style.pointerEvents = 'auto';
            selectedTracksDiv.style.visibility = 'visible';
            
            // Hacer scroll suave hacia la sección si es necesario
            setTimeout(() => {
                selectedTracksDiv.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }

    updateSelectedTracksList() {
        const selectedTracksDiv = document.getElementById('selected-tracks');
        if (!selectedTracksDiv) return;
        
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');

        selectedTracksDiv.innerHTML = '';

        if (selectedTracks.length === 0) {
            selectedTracksDiv.innerHTML = `
                <div class="no-tracks">
                    <i class="fas fa-music"></i>
                    <p>No hay canciones seleccionadas</p>
                    <small>Busca y agrega canciones específicas a tu playlist</small>
                </div>
            `;
            selectedTracksDiv.classList.remove('has-tracks');
            return;
        }
        
        // Agregar clase para indicar que hay canciones seleccionadas
        selectedTracksDiv.classList.add('has-tracks');

        selectedTracks.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'selected-track';
            trackDiv.setAttribute('data-uri', track.uri);
            trackDiv.style.opacity = '0';
            trackDiv.style.transform = 'translateY(20px)';
            trackDiv.style.transition = 'all 0.3s ease';
            
            trackDiv.innerHTML = `
                <img src="${track.album.image || 'https://via.placeholder.com/40?text=🎵'}" alt="${track.album.name}">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <button class="remove-track" data-uri="${track.uri}" title="Eliminar canción">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const removeButton = trackDiv.querySelector('.remove-track');
            removeButton.addEventListener('click', () => this.removeTrack(track.uri));

            selectedTracksDiv.appendChild(trackDiv);
            
            // Animación de entrada escalonada
            setTimeout(() => {
                trackDiv.style.opacity = '1';
                trackDiv.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    updatePlaylistPreview() {
        const previewDiv = document.getElementById('playlist-preview');
        if (!previewDiv) return;
        
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        // Obtener el nombre de la playlist del formulario
        const playlistName = document.getElementById('playlist-name')?.value || 'Mi Playlist';
        
        // Preservar las canciones generadas por artista que ya están en la vista previa
        const artistGeneratedTracks = window.currentPlaylistTracks || [];
        
        // Combinar canciones generadas por artista + canciones seleccionadas específicamente
        const allTracks = [...artistGeneratedTracks, ...selectedTracks];
        
        // Eliminar duplicados basándose en el URI
        const uniqueTracks = allTracks.filter((track, index, self) => 
            index === self.findIndex(t => t.uri === track.uri)
        );
        
        // Crear la vista previa con todas las canciones
        const data = {
            success: true,
            playlistName: playlistName,
            tracks: uniqueTracks
        };
        
        // Llamar a la función global de vista previa
        if (typeof displayPlaylistPreview === 'function') {
            displayPlaylistPreview(data);
        } else {
            // Si la función no está disponible, crear una vista previa básica
            this.createBasicPreview(data);
        }
        
        // Mostrar la nueva sección de exportar a Spotify
        const spotifyExportSection = document.querySelector('.spotify-export-section');
        if (spotifyExportSection) {
            spotifyExportSection.style.display = 'block';
            spotifyExportSection.style.opacity = '0';
            spotifyExportSection.style.transform = 'translateY(50px)';
            spotifyExportSection.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                spotifyExportSection.style.opacity = '1';
                spotifyExportSection.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    createBasicPreview(data) {
        const previewDiv = document.getElementById('playlist-preview');
        const exportButton = document.getElementById('export-spotify');
        
        if (!previewDiv) return;
        
        // Calcular estadísticas separadas
        const artistGeneratedTracks = window.currentPlaylistTracks || [];
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        
        previewDiv.innerHTML = `
            <div class="preview-header">
                <h4>Vista previa: ${data.playlistName}</h4>
                <p>${data.tracks.length} canciones en total</p>
                <div class="preview-stats">
                    <span class="stat-item">
                        <i class="fas fa-music"></i>
                        ${artistGeneratedTracks.length} generadas
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-heart"></i>
                        ${selectedTracks.length} seleccionadas
                    </span>
                </div>
            </div>
            <div class="preview-tracks">
                ${data.tracks.map((track, index) => `
                    <div class="preview-track" data-track-index="${index}">
                        <img src="${track.album.image || 'https://via.placeholder.com/40?text=🎵'}" alt="${track.album.name}">
                        <div class="track-info">
                            <div class="track-name">${track.name}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <button class="remove-track-btn" onclick="removeTrackFromPreview(${index})" title="Eliminar canción">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        previewDiv.style.display = 'block';
        if (exportButton) {
            exportButton.style.display = 'block';
            exportButton.classList.add('pulse');
            exportButton.style.animation = 'exportPulse 2s infinite';
        }
    }

    updateExportButtonState() {
        const exportSection = document.querySelector('.export-section');
        if (exportSection) {
            const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
            const hasGeneratedTracks = window.currentPlaylistTracks && window.currentPlaylistTracks.length > 0;
            
            if (selectedTracks.length > 0 || hasGeneratedTracks) {
                // Mostrar la sección de exportar si no está visible
                if (exportSection.style.display === 'none') {
                    exportSection.style.display = 'block';
                    exportSection.style.opacity = '0';
                    exportSection.style.transform = 'translateY(20px)';
                    exportSection.style.transition = 'all 0.5s ease';
                    
                    setTimeout(() => {
                        exportSection.style.opacity = '1';
                        exportSection.style.transform = 'translateY(0)';
                    }, 100);
                }
                
                // Activar el efecto de pulso en el botón
                const exportButton = exportSection.querySelector('.action-btn.primary');
                if (exportButton) {
                    exportButton.classList.add('pulse');
                    exportButton.style.animation = 'exportPulse 2s infinite';
                }
            } else {
                // Ocultar la sección de exportar si no hay canciones
                exportSection.style.opacity = '0';
                exportSection.style.transform = 'translateY(20px)';
                exportSection.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    exportSection.style.display = 'none';
                }, 500);
                
                // Desactivar el efecto de pulso
                const exportButton = exportSection.querySelector('.action-btn.primary');
                if (exportButton) {
                    exportButton.classList.remove('pulse');
                    exportButton.style.animation = 'none';
                }
            }
        }
    }

    checkSelectedTracks() {
        const selectedTracks = JSON.parse(localStorage.getItem('selectedTracks') || '[]');
        if (selectedTracks.length > 0) {
            // Si hay canciones seleccionadas, mostrar la vista previa automáticamente
            setTimeout(() => {
                this.updatePlaylistPreview();
                this.updateExportButtonState();
            }, 500); // Pequeño delay para asegurar que el DOM esté listo
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Función para actualizar el espaciado de búsqueda
    updateSearchSpacing() {
        const searchSuggestions = document.querySelector('#search-suggestions');
        const selectedTracksContainer = document.querySelector('#selected-tracks');
        
        if (!searchSuggestions || !selectedTracksContainer) return;
        
        // Verificar si hay sugerencias visibles
        const hasVisibleSuggestions = searchSuggestions.style.display !== 'none' && 
                                    searchSuggestions.classList.contains('has-suggestions');
        
        if (hasVisibleSuggestions) {
            selectedTracksContainer.classList.add('needs-spacing');
        } else {
            selectedTracksContainer.classList.remove('needs-spacing');
        }
    }
}

// Inicializar el gestor de búsqueda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event triggered');
    console.log('window.searchManager exists:', !!window.searchManager);
    // Solo inicializar si no existe ya una instancia
    if (!window.searchManager) {
        console.log('Creating new SearchManager instance');
        window.searchManager = new SearchManager();
        console.log('SearchManager instance created:', window.searchManager);
    } else {
        console.log('SearchManager already exists, skipping initialization');
    }
});

// Agregar estilos CSS para las nuevas animaciones
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes addConfirmation {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes addConfirmationOut {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
    }
    
    .no-tracks {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }
    
    .no-tracks i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .no-tracks p {
        margin: 0.5rem 0;
        font-weight: 600;
    }
    
    .no-tracks small {
        opacity: 0.7;
        font-size: 0.875rem;
    }
    
    .search-loading {
        padding: 1rem;
        text-align: center;
        color: var(--text-secondary);
    }
    
    .search-loading .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top: 2px solid #1db954;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 0.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(additionalStyles); 