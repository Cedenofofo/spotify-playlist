# Tuneuptify - Spotify Playlist Manager

Un gestor de playlists de Spotify que te permite crear, gestionar y exportar playlists personalizadas. Desarrollado con PHP, JavaScript y la API de Spotify.

## Características

- 🔐 Autenticación OAuth 2.0 con Spotify
- 🎵 Búsqueda de canciones en tiempo real
- 📝 Creación de playlists personalizadas
- 🎨 Interfaz moderna y responsive
- 📱 Compatible con dispositivos móviles
- 🚀 Exportación directa a Spotify
- 🔍 Autocompletado de artistas y canciones
- 📊 Vista previa de playlists antes de exportar
- ♿ Accesibilidad mejorada
- 🌙 Soporte para modo oscuro
- ⚡ Micro-interacciones y animaciones

## Tecnologías Utilizadas

- **Backend**: PHP 8.0+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Spotify Web API
- **Autenticación**: OAuth 2.0 con PKCE
- **Despliegue**: GitHub Pages + PHP local
- **Iconos**: Font Awesome

## Instalación Local

### Prerrequisitos

- PHP 8.0 o superior
- Composer (para dependencias)
- Cuenta de desarrollador de Spotify
- Servidor web local (Apache/Nginx) o servidor PHP integrado

### Configuración

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/spotify-playlist-desktop.git
   cd spotify-playlist-desktop
   ```

2. **Instala las dependencias:**
   ```bash
   composer install
   ```

3. **Configura las credenciales de Spotify:**
   - Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Crea una nueva aplicación
   - Copia el `Client ID` y `Client Secret`
   - En `config.php`, actualiza las credenciales:
   ```php
   define('SPOTIFY_CLIENT_ID', 'tu-client-id');
   define('SPOTIFY_CLIENT_SECRET', 'tu-client-secret');
   define('SPOTIFY_REDIRECT_URI', 'http://localhost:8000/callback.php');
   ```

4. **Inicia el servidor PHP:**
   ```bash
   php -S localhost:8000
   ```

5. **Abre tu navegador:**
   ```
   http://localhost:8000
   ```

## Uso

1. **Inicia sesión con Spotify** usando el botón de login
2. **Busca canciones** usando el campo de búsqueda
3. **Agrega artistas** a tu playlist con el botón "Agregar Artista"
4. **Selecciona canciones** de los resultados de búsqueda
5. **Configura tu playlist** con nombre y descripción
6. **Exporta a Spotify** cuando estés listo

## Estructura del Proyecto

```
spotify-playlist-desktop/
├── css/                 # Estilos CSS
├── js/                  # JavaScript del frontend
├── sessions/            # Sesiones PHP
├── config.php           # Configuración de Spotify
├── auth.php             # Autenticación OAuth
├── callback.php         # Callback de OAuth
├── search_track.php     # API de búsqueda
├── create_playlist.php  # Creación de playlists
├── export_to_spotify.php # Exportación a Spotify
└── index.html           # Página principal
```

## Configuración para GitHub Pages

El proyecto está configurado para funcionar tanto localmente como en GitHub Pages:

- **Local**: Usa PHP backend completo
- **GitHub Pages**: Usa autenticación PKCE en el frontend

### Variables de Entorno para GitHub Pages

Configura estos secretos en tu repositorio de GitHub:

- `SPOTIFY_CLIENT_ID`: Tu Client ID de Spotify
- `SPOTIFY_REDIRECT_URI`: URL de callback (ej: `https://tu-usuario.github.io/spotify-playlist-desktop/callback.html`)

## Mejoras Implementadas

### 🎨 UI/UX
- Sistema de variables CSS para consistencia
- Micro-interacciones y animaciones suaves
- Diseño responsive para todos los dispositivos
- Efectos hover y focus mejorados
- Sombras y bordes modernos

### ♿ Accesibilidad
- Navegación por teclado completa
- ARIA labels para lectores de pantalla
- Soporte para `prefers-reduced-motion`
- Modo de alto contraste
- Focus visible en todos los elementos interactivos

### 📱 Responsive Design
- Breakpoints optimizados para móvil, tablet y desktop
- Layout flexible que se adapta a cualquier pantalla
- Tipografía escalable
- Espaciado consistente

### 🌙 Características Modernas
- Soporte para modo oscuro del sistema
- Variables CSS para fácil personalización
- Transiciones suaves y naturales
- Iconos de redes sociales en el footer

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

- **X (Twitter)**: [@cedenofofo](https://x.com/cedenofofo)
- **Instagram**: [@cedenofofo](https://instagram.com/cedenofofo)

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en GitHub.

---

**Desarrollado con ❤️ para la comunidad de Spotify**

© 2025 Tuneuptify. Todos los derechos reservados. 