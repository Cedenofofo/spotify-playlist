window.config = {
    // Detectar si estamos en GitHub Pages o en local
    isGitHubPages: window.location.hostname.includes('github.io'),
    
    // URLs base
    baseUrl: window.location.hostname.includes('github.io') 
        ? 'https://cedenofofo.github.io/spotify-playlist'  // Para GitHub Pages
        : '',                  // Para desarrollo local
    
    // Configuración de Spotify
    clientId: 'TU_CLIENT_ID_AQUI', // <-- PON AQUÍ TU CLIENT ID DE SPOTIFY
    // clientSecret: 'NO SE USA EN GITHUB PAGES', // Nunca subas el clientSecret al frontend
    redirectUri: window.location.hostname.includes('github.io')
        ? 'https://cedenofofo.github.io/spotify-playlist/callback.html'
        : 'http://127.0.0.1/spotify-playlist/callback.php',
    
    // URLs de la API
    authUrl: 'https://accounts.spotify.com/authorize',
    apiUrl: 'https://api.spotify.com/v1',
    
    // Scopes necesarios
    scopes: [
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-private'
    ]
};

// NOTA: Para GitHub Pages solo necesitas el clientId y la redirectUri a callback.html
// El clientSecret solo se usa en el backend local (PHP) y nunca debe subirse al frontend. 