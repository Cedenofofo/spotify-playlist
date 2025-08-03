// ===== MODIFY PLAYLISTS MANAGER =====

class ModifyPlaylistsManager {
    constructor() {
        this.auth = new Auth();
        this.playlists = [];
        this.filteredPlaylists = [];
        this.selectedPlaylists = new Set(); // Para selección múltiple
        this.setupEventListeners();
        this.checkAuth();
        console.log('ModifyPlaylistsManager inicializado');
    }

    setupEventListeners() {
        // Event listener para búsqueda de playlists
        const searchInput = document.getElementById('search-playlists');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim().toLowerCase();
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.filterPlaylists(query);
                }, 300);
            });
        }

        // Efecto ripple para el botón de volver
        this.setupRippleEffect();

        // Cursor personalizado
        this.initCustomCursor();

        // Botones de selección múltiple
        this.setupMultiSelectButtons();
    }

    setupMultiSelectButtons() {
        // Agregar botones de selección múltiple al HTML
        const playlistsContainer = document.getElementById('playlists-grid');
        if (playlistsContainer) {
            const multiSelectContainer = document.createElement('div');
            multiSelectContainer.className = 'multi-select-container';
            multiSelectContainer.innerHTML = `
                <div class="multi-select-actions">
                    <button type="button" id="select-all-playlists-btn" class="action-btn secondary">
                        <i class="fas fa-check-square"></i>
                        <span>Seleccionar todo</span>
                    </button>
                    <button type="button" id="deselect-all-playlists-btn" class="action-btn secondary" style="display: none;">
                        <i class="fas fa-square"></i>
                        <span>Deseleccionar todo</span>
                    </button>
                    <button type="button" id="delete-selected-playlists-btn" class="action-btn remove" style="display: none;">
                        <i class="fas fa-trash"></i>
                        <span>Eliminar seleccionadas</span>
                    </button>
                </div>
            `;
            playlistsContainer.parentNode.insertBefore(multiSelectContainer, playlistsContainer);

            // Event listeners para botones de selección múltiple
            document.getElementById('select-all-playlists-btn').addEventListener('click', () => {
                this.selectAllPlaylists();
            });

            document.getElementById('deselect-all-playlists-btn').addEventListener('click', () => {
                this.deselectAllPlaylists();
            });

            document.getElementById('delete-selected-playlists-btn').addEventListener('click', () => {
                this.deleteSelectedPlaylists();
            });
        }
    }

    setupRippleEffect() {
        const backBtn = document.querySelector('.elegant-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                const ripple = this.querySelector('.btn-ripple');
                if (ripple) {
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.style.animation = 'none';
                    ripple.offsetHeight; // Trigger reflow
                    ripple.style.animation = 'ripple 0.6s linear';
                }
            });
        }
    }

    initCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        const follower = document.querySelector('.custom-cursor-follower');
        
        if (!cursor || !follower) return;
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 50);
        });
        
        // Efectos de hover
        const interactiveElements = document.querySelectorAll('button, .playlist-card, .action-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                follower.style.transform = 'scale(1.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
            });
        });
    }

    async getCurrentUserId() {
        try {
            console.log('Obteniendo ID de usuario...');
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                console.error('No hay token disponible');
                return null;
            }

            // Agregar timeout para evitar que se quede colgado
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const userData = await response.json();
                console.log('ID de usuario obtenido exitosamente:', userData.id);
                return userData.id;
            } else {
                console.error(`Error al obtener ID de usuario: ${response.status} - ${response.statusText}`);
                if (response.status === 401) {
                    console.error('Token expirado');
                    this.auth.logout();
                }
                return null;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Timeout al obtener ID de usuario');
            } else {
                console.error('Error al obtener ID de usuario:', error);
            }
            return null;
        }
    }

    checkAuth() {
        console.log('Verificando autenticación...');
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
            console.log('No hay token, redirigiendo al login');
            window.location.href = 'index.html';
            return;
        }
        console.log('Token encontrado, iniciando carga de playlists');
        this.loadPlaylists();
    }

    // Función de retry para requests que pueden fallar
    async retryRequest(fetchFn, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fetchFn();
            } catch (error) {
                console.warn(`Intento ${attempt} falló:`, error);
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    async loadPlaylists() {
        try {
            console.log('=== INICIANDO CARGA DE PLAYLISTS ===');
            this.showLoadingState();
            
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                console.error('No hay token de acceso');
                this.auth.logout();
                return;
            }

            console.log('Token encontrado, obteniendo ID de usuario...');
            const userId = await this.getCurrentUserId();
            if (!userId) {
                console.error('No se pudo obtener el ID de usuario');
                this.showErrorState();
                return;
            }

            console.log('ID de usuario obtenido:', userId);

            let allPlaylists = [];
            let nextUrl = `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`;
            let pageCount = 0;
            const maxPages = 10; // Límite de seguridad

            // Cargar todas las playlists del usuario con límite de páginas
            while (nextUrl && pageCount < maxPages) {
                pageCount++;
                console.log(`Cargando página ${pageCount}: ${nextUrl}`);
                
                try {
                    const response = await fetch(nextUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        console.error(`Error en página ${pageCount}: ${response.status} - ${response.statusText}`);
                        if (response.status === 401) {
                            console.error('Token expirado, redirigiendo al login');
                            this.auth.logout();
                            return;
                        }
                        throw new Error(`Error al cargar playlists: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(`Página ${pageCount}: ${data.items?.length || 0} playlists cargadas`);
                    
                    if (data.items) {
                        allPlaylists = allPlaylists.concat(data.items);
                    }
                    
                    nextUrl = data.next;
                    
                    // Pequeña pausa para no sobrecargar la API
                    if (nextUrl) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    
                } catch (error) {
                    console.error(`Error en página ${pageCount}:`, error);
                    break;
                }
            }

            console.log(`Total de playlists cargadas: ${allPlaylists.length}`);

            // También cargar playlists colaborativas (con manejo de errores)
            try {
                console.log('Cargando playlists colaborativas...');
                const collaborativeResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (collaborativeResponse.ok) {
                    const collaborativeData = await collaborativeResponse.json();
                    console.log(`Playlists colaborativas encontradas: ${collaborativeData.items?.length || 0}`);
                    
                    // Filtrar playlists que no están en la lista principal
                    const existingIds = new Set(allPlaylists.map(p => p.id));
                    const newCollaborative = collaborativeData.items.filter(p => !existingIds.has(p.id));
                    allPlaylists = allPlaylists.concat(newCollaborative);
                    console.log(`Nuevas playlists colaborativas agregadas: ${newCollaborative.length}`);
                } else {
                    console.warn('Error al cargar playlists colaborativas:', collaborativeResponse.status);
                }
            } catch (error) {
                console.warn('Error al cargar playlists colaborativas:', error);
            }

            // Eliminar duplicados
            const uniquePlaylists = [];
            const seenIds = new Set();
            
            for (const playlist of allPlaylists) {
                if (!seenIds.has(playlist.id)) {
                    seenIds.add(playlist.id);
                    uniquePlaylists.push(playlist);
                }
            }

            console.log(`Playlists únicas finales: ${uniquePlaylists.length}`);

            this.playlists = uniquePlaylists;
            this.filteredPlaylists = [...this.playlists];
            
            console.log('=== CARGA DE PLAYLISTS COMPLETADA ===');
            
            if (this.playlists.length === 0) {
                console.log('No se encontraron playlists, mostrando estado vacío');
                this.showEmptyState();
            } else {
                console.log('Mostrando playlists en la interfaz');
                this.displayPlaylists();
                this.showNotification(`Se cargaron ${this.playlists.length} playlists`, 'success');
            }

        } catch (error) {
            console.error('Error general en loadPlaylists:', error);
            this.showErrorState();
        }
    }

    filterPlaylists(query) {
        if (!query) {
            this.filteredPlaylists = [...this.playlists];
        } else {
            this.filteredPlaylists = this.playlists.filter(playlist =>
                playlist.name.toLowerCase().includes(query) ||
                (playlist.description && playlist.description.toLowerCase().includes(query))
            );
        }
        this.displayPlaylists();
    }

    displayPlaylists() {
        console.log('=== INICIANDO DISPLAY PLAYLISTS ===');
        console.log(`Playlists a mostrar: ${this.filteredPlaylists.length}`);
        
        const container = document.getElementById('playlists-grid');
        console.log('Contenedor encontrado:', container);
        
        if (!container) {
            console.error('❌ No se encontró el contenedor #playlists-grid');
            return;
        }

        // Ocultar estados de carga y error
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const emptyState = document.getElementById('empty-state');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        if (this.filteredPlaylists.length === 0) {
            console.log('No hay playlists para mostrar, mostrando estado vacío');
            if (emptyState) {
                emptyState.style.display = 'block';
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-music"></i>
                        <h3>No se encontraron playlists</h3>
                        <p>Intenta con una búsqueda diferente o crea una nueva playlist</p>
                    </div>
                `;
            }
            return;
        }

        console.log('Generando HTML para las playlists...');
        const playlistsHTML = this.filteredPlaylists.map(playlist => {
            const isSelected = this.selectedPlaylists.has(playlist.id);
            console.log(`Generando card para playlist: ${playlist.name} (ID: ${playlist.id})`);
            return this.createPlaylistCard(playlist, isSelected);
        }).join('');

        console.log('HTML generado, actualizando contenedor...');
        container.innerHTML = playlistsHTML;
        container.style.display = 'grid';
        
        console.log('Configurando event listeners...');
        this.setupPlaylistCardListeners();
        this.updateMultiSelectButtons();
        
        console.log('=== DISPLAY PLAYLISTS COMPLETADO ===');
    }

    createPlaylistCard(playlist, isSelected = false) {
        const imageUrl = this.getPlaylistImageUrl(playlist);
        const trackCount = playlist.tracks?.total || 0;
        const isPublic = playlist.public ? 'Pública' : 'Privada';
        
        return `
            <div class="playlist-card ${isSelected ? 'selected' : ''}" data-playlist-id="${playlist.id}">
                <!-- Header con imagen -->
                <div class="playlist-card-header">
                    <img src="${imageUrl}" 
                         alt="${this.escapeHtml(playlist.name)}" 
                         class="playlist-card-image"
                         onerror="this.onerror=null; this.src='${this.generatePlaylistPlaceholder(playlist.name)}'; this.classList.add('placeholder');"
                         onload="this.classList.remove('placeholder');">
                    
                    <!-- Checkbox en la esquina superior izquierda -->
                    <div class="playlist-card-checkbox">
                        <input type="checkbox" id="playlist-${playlist.id}" ${isSelected ? 'checked' : ''} 
                               onchange="modifyPlaylistsManager.togglePlaylistSelection('${playlist.id}')">
                        <label for="playlist-${playlist.id}"></label>
                    </div>
                </div>
                
                <!-- Contenido de la card -->
                <div class="playlist-card-content">
                    <!-- Título y descripción -->
                    <div>
                        <h3 class="playlist-card-title" title="${this.escapeHtml(playlist.name)}">
                            ${this.escapeHtml(playlist.name)}
                        </h3>
                        <p class="playlist-card-description" title="${this.escapeHtml(playlist.description || 'Sin descripción')}">
                            ${this.escapeHtml(playlist.description || 'Sin descripción')}
                        </p>
                    </div>
                    
                    <!-- Estadísticas -->
                    <div class="playlist-card-stats">
                        <div class="playlist-card-stat">
                            <i class="fas fa-music"></i>
                            <span>${trackCount} canciones</span>
                        </div>
                        <div class="playlist-card-stat">
                            <i class="fas fa-eye"></i>
                            <span>${isPublic}</span>
                        </div>
                    </div>
                    
                    <!-- Acciones -->
                    <div class="playlist-card-actions">
                        <button class="playlist-card-action play" onclick="modifyPlaylistsManager.viewPlaylist('${playlist.id}')" title="Ver playlist">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="playlist-card-action edit" onclick="modifyPlaylistsManager.editPlaylist('${playlist.id}')" title="Editar playlist">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="playlist-card-action delete" onclick="modifyPlaylistsManager.deletePlaylist('${playlist.id}', '${this.escapeHtml(playlist.name)}')" title="Eliminar playlist">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getPlaylistImageUrl(playlist) {
        // Si no hay imágenes, usar placeholder elegante
        if (!playlist.images || playlist.images.length === 0) {
            return 'https://via.placeholder.com/80x80/1db954/ffffff?text=🎵';
        }

        // Buscar la mejor imagen disponible
        let bestImage = null;
        
        // Estrategia 1: Buscar imágenes que NO sean collages (evitar URLs con múltiples imágenes)
        for (const image of playlist.images) {
            if (image && image.url) {
                // Evitar URLs que parezcan collages o múltiples imágenes
                const url = image.url.toLowerCase();
                if (!url.includes('mosaic') && 
                    !url.includes('collage') && 
                    !url.includes('multiple') &&
                    !url.includes('grid') &&
                    url.includes('spotify')) {
                    bestImage = image.url;
                    break;
                }
            }
        }

        // Estrategia 2: Si no encontramos una imagen única, usar la primera disponible
        if (!bestImage) {
            for (const image of playlist.images) {
                if (image && image.url) {
                    bestImage = image.url;
                    break;
                }
            }
        }

        // Estrategia 3: Si la imagen parece ser un collage, usar placeholder personalizado
        if (bestImage) {
            const url = bestImage.toLowerCase();
            if (url.includes('mosaic') || 
                url.includes('collage') || 
                url.includes('multiple') ||
                url.includes('grid')) {
                // Usar placeholder personalizado en lugar de collage
                return this.generatePlaylistPlaceholder(playlist.name);
            }
        }

        // Fallback final
        if (!bestImage) {
            return this.generatePlaylistPlaceholder(playlist.name);
        }

        return bestImage;
    }

    // Generar placeholder personalizado basado en el nombre de la playlist
    generatePlaylistPlaceholder(playlistName) {
        const colors = [
            '#1db954', '#1ed760', '#2ecc71', '#27ae60', '#16a085',
            '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#e74c3c',
            '#c0392b', '#f39c12', '#e67e22', '#f1c40f', '#f7dc6f'
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const initials = playlistName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        return `https://via.placeholder.com/80x80/${randomColor.replace('#', '')}/ffffff?text=${encodeURIComponent(initials)}`;
    }

    setupPlaylistCardListeners() {
        // Event listeners para las cards de playlist
        const playlistCards = document.querySelectorAll('.playlist-card');
        playlistCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // No activar si se hace clic en checkbox o botones
                if (e.target.closest('.playlist-checkbox') || e.target.closest('.playlist-actions')) {
                    return;
                }
                
                const playlistId = card.dataset.playlistId;
                this.editPlaylist(playlistId);
            });
        });
    }

    async viewPlaylist(playlistId) {
        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar playlist: ${response.status}`);
            }

            const playlist = await response.json();
            this.showPlaylistDetailsModal(playlist);

        } catch (error) {
            console.error('Error al cargar playlist:', error);
            this.showNotification('Error al cargar la playlist', 'error');
        }
    }

    async editPlaylist(playlistId) {
        window.location.href = `edit_playlist.html?id=${playlistId}`;
    }

    async deletePlaylist(playlistId, playlistName) {
        const confirmed = confirm(`¿Estás seguro de que quieres eliminar la playlist "${playlistName}"?`);
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            // Obtener el ID del usuario actual
            const userId = await this.getCurrentUserId();
            if (!userId) {
                throw new Error('No se pudo obtener el ID de usuario');
            }

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remover de la lista local
                this.playlists = this.playlists.filter(p => p.id !== playlistId);
                this.filteredPlaylists = this.filteredPlaylists.filter(p => p.id !== playlistId);
                this.selectedPlaylists.delete(playlistId);
                
                this.displayPlaylists();
                this.showNotification(`Playlist "${playlistName}" eliminada`, 'success');
            } else {
                throw new Error(`Error al eliminar playlist: ${response.status}`);
            }

        } catch (error) {
            console.error('Error al eliminar playlist:', error);
            this.showNotification('Error al eliminar la playlist', 'error');
        }
    }

    // Funciones de selección múltiple para playlists
    togglePlaylistSelection(playlistId) {
        if (this.selectedPlaylists.has(playlistId)) {
            this.selectedPlaylists.delete(playlistId);
        } else {
            this.selectedPlaylists.add(playlistId);
        }
        this.displayPlaylists();
        this.updateMultiSelectButtons();
    }

    selectAllPlaylists() {
        this.filteredPlaylists.forEach(playlist => {
            this.selectedPlaylists.add(playlist.id);
        });
        this.displayPlaylists();
        this.updateMultiSelectButtons();
    }

    deselectAllPlaylists() {
        this.selectedPlaylists.clear();
        this.displayPlaylists();
        this.updateMultiSelectButtons();
    }

    async deleteSelectedPlaylists() {
        if (this.selectedPlaylists.size === 0) {
            this.showNotification('No hay playlists seleccionadas', 'warning');
            return;
        }

        const confirmed = confirm(`¿Estás seguro de que quieres eliminar ${this.selectedPlaylists.size} playlist(s)?`);
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('spotify_access_token');
            if (!token) {
                this.auth.logout();
                return;
            }

            const userId = await this.getCurrentUserId();
            if (!userId) {
                throw new Error('No se pudo obtener el ID de usuario');
            }

            let deletedCount = 0;
            for (const playlistId of this.selectedPlaylists) {
                try {
                    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        deletedCount++;
                    }
                } catch (error) {
                    console.error(`Error al eliminar playlist ${playlistId}:`, error);
                }
            }

            // Actualizar listas locales
            this.playlists = this.playlists.filter(p => !this.selectedPlaylists.has(p.id));
            this.filteredPlaylists = this.filteredPlaylists.filter(p => !this.selectedPlaylists.has(p.id));
            this.selectedPlaylists.clear();

            this.displayPlaylists();
            this.updateMultiSelectButtons();
            this.showNotification(`${deletedCount} playlist(s) eliminada(s)`, 'success');

        } catch (error) {
            console.error('Error al eliminar playlists seleccionadas:', error);
            this.showNotification('Error al eliminar las playlists', 'error');
        }
    }

    updateMultiSelectButtons() {
        const selectAllBtn = document.getElementById('select-all-playlists-btn');
        const deselectAllBtn = document.getElementById('deselect-all-playlists-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-playlists-btn');

        if (!selectAllBtn || !deselectAllBtn || !deleteSelectedBtn) return;

        if (this.selectedPlaylists.size === 0) {
            selectAllBtn.style.display = 'inline-flex';
            deselectAllBtn.style.display = 'none';
            deleteSelectedBtn.style.display = 'none';
        } else if (this.selectedPlaylists.size === this.filteredPlaylists.length) {
            selectAllBtn.style.display = 'none';
            deselectAllBtn.style.display = 'inline-flex';
            deleteSelectedBtn.style.display = 'inline-flex';
        } else {
            selectAllBtn.style.display = 'inline-flex';
            deselectAllBtn.style.display = 'inline-flex';
            deleteSelectedBtn.style.display = 'inline-flex';
        }
    }

    showPlaylistDetailsModal(playlist) {
        // Implementar modal de detalles si es necesario
        console.log('Mostrar detalles de playlist:', playlist);
    }

    showEditPlaylistModal(playlist) {
        // Implementar modal de edición si es necesario
        console.log('Mostrar modal de edición:', playlist);
    }

    async savePlaylistChanges(playlistId) {
        // Implementar guardado de cambios si es necesario
        console.log('Guardar cambios para playlist:', playlistId);
    }

    showLoadingState() {
        const container = document.querySelector('.playlists-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                    <p>Cargando playlists...</p>
                </div>
            `;
        }
    }

    showErrorState() {
        const container = document.querySelector('.playlists-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar playlists</h3>
                    <p>Intenta recargar la página</p>
                    <button onclick="modifyPlaylistsManager.loadPlaylists()" class="action-btn primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    showEmptyState() {
        const container = document.querySelector('.playlists-grid');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No tienes playlists</h3>
                    <p>Crea tu primera playlist para comenzar</p>
                    <a href="index.html#playlist-section" class="action-btn primary">
                        Crear playlist
                    </a>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            padding: 1rem 1.5rem; border-radius: 10px; 
            color: white; font-weight: 500; z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

        // Configurar colores según tipo
        switch (type) {
            case 'success':
                notification.style.background = '#2ecc71';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            case 'warning':
                notification.style.background = '#f39c12';
                break;
            default:
                notification.style.background = '#3498db';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.modifyPlaylistsManager = new ModifyPlaylistsManager();
});

function goBack() {
    window.history.back();
} 