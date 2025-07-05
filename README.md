# 🎵 Tuneuptify - Spotify Playlist Manager

Una aplicación web moderna para gestionar tus playlists de Spotify de manera fácil y rápida.

## ✨ Características

* 🎵 **Crear Playlists**: Genera playlists personalizadas con tu música favorita
* 🔍 **Buscar Canciones**: Encuentra y añade canciones de Spotify fácilmente
* 👥 **Gestionar Artistas**: Organiza tu música por artistas favoritos
* 🔄 **Sincronizar**: Mantén tus playlists sincronizadas con Spotify
* 🎨 **Interfaz Moderna**: Diseño intuitivo y responsive
* 🖥️ **Aplicación de Escritorio**: Versión Electron para uso offline

## 🛠️ Tecnologías Utilizadas

* **Frontend**: HTML5, CSS3, JavaScript
* **Backend**: PHP
* **Desktop**: Electron
* **API**: Spotify Web API
* **Iconos**: Font Awesome
* **Hosting**: GitHub Pages

## 🚀 Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Cedenofofo/spotify-playlist.git
cd spotify-playlist
```

### 2. Configurar Spotify Developer Dashboard

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación
3. Anota tu `Client ID` y `Client Secret`
4. Configura las URLs de redirección:
   * Para desarrollo local: `http://localhost:3000/callback.php`
   * Para producción: `https://tu-dominio.com/callback.php`

### 3. Configurar Variables

Edita el archivo `js/config.js`:

```javascript
window.config = {
    clientId: 'TU_CLIENT_ID_AQUI',
    clientSecret: 'TU_CLIENT_SECRET_AQUI',
    redirectUri: 'TU_URL_DE_REDIRECCION'
};
```

Edita el archivo `config.php`:

```php
define('SPOTIFY_CLIENT_ID', 'TU_CLIENT_ID_AQUI');
define('SPOTIFY_CLIENT_SECRET', 'TU_CLIENT_SECRET_AQUI');
define('SPOTIFY_REDIRECT_URI', 'TU_URL_DE_REDIRECCION');
```

### 4. Instalar Dependencias

```bash
# Instalar dependencias de Node.js (para Electron)
npm install

# Instalar dependencias de PHP (si usas Composer)
composer install
```

## 📱 Uso

### Versión Web (Servidor PHP)

1. Configura un servidor web con PHP
2. Configura las credenciales de Spotify
3. Accede a `index.php`
4. Inicia sesión con tu cuenta de Spotify
5. ¡Comienza a gestionar tus playlists!

### Versión Desktop (Electron)

```bash
# Desarrollo
npm run dev

# Construir aplicación
npm run build

# Ejecutar aplicación
npm start
```

## 📁 Estructura del Proyecto

```
spotify-playlist/
├── css/                 # Estilos CSS
│   ├── style.css       # Estilos principales
│   ├── search.css      # Estilos de búsqueda
│   └── styles.css      # Estilos adicionales
├── js/                  # JavaScript del frontend
│   ├── config.js       # Configuración
│   ├── search.js       # Gestor de búsqueda
│   ├── main.js         # Gestor de playlists
│   └── auth.js         # Autenticación
├── img/                 # Imágenes y logos
├── sessions/            # Sesiones PHP
├── .github/             # Configuración GitHub Actions
├── main.js              # Configuración Electron
├── package.json         # Dependencias Node.js
├── composer.json        # Dependencias PHP
├── index.html           # Página principal (GitHub Pages)
├── index.php            # Aplicación principal
├── config.php           # Configuración PHP
├── auth.php             # Autenticación Spotify
├── callback.php         # Callback de autenticación
├── spotify_api.php      # Funciones de la API
└── README.md            # Este archivo
```

## 🔧 Funcionalidades Principales

### Autenticación

* OAuth 2.0 con Spotify
* Gestión de tokens de acceso
* Renovación automática de tokens

### Gestión de Playlists

* Crear nuevas playlists
* Añadir canciones por artista
* Búsqueda de canciones específicas
* Vista previa antes de crear

### API de Spotify

* Búsqueda de artistas y canciones
* Creación de playlists
* Añadir canciones a playlists
* Gestión de permisos

## 🎨 Personalización

### Colores

Los colores principales de la aplicación son:

* **Verde Spotify**: `#1db954`
* **Azul**: `#00cfff`
* **Negro**: `#191414`

### Estilos

Los estilos están organizados en:

* `css/style.css`: Estilos principales
* `css/search.css`: Estilos de búsqueda
* `css/styles.css`: Estilos adicionales

## 🔒 Seguridad

* OAuth 2.0 con validación de estado
* Tokens de acceso con renovación automática
* Sesiones PHP seguras
* Validación de entrada de datos

## 🚀 Despliegue

### GitHub Pages

El proyecto incluye configuración para GitHub Pages. Para activarlo:

1. Ve a Settings > Pages en tu repositorio
2. Selecciona la rama `main`
3. Configura el directorio raíz
4. La aplicación estará disponible en: `https://tu-usuario.github.io/spotify-playlist`

### Servidor Web

Para desplegar en un servidor web:

1. Sube todos los archivos al servidor
2. Configura las credenciales de Spotify
3. Asegúrate de que PHP esté habilitado
4. Configura las URLs de redirección en Spotify Developer Dashboard

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

* [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
* [Font Awesome](https://fontawesome.com/) por los iconos
* [GitHub Pages](https://pages.github.com/) por el hosting
* [Electron](https://www.electronjs.org/) por la aplicación de escritorio

## 📞 Contacto

* **GitHub**: [@Cedenofofo](https://github.com/Cedenofofo)
* **Proyecto**: [spotify-playlist](https://github.com/Cedenofofo/spotify-playlist)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub! 