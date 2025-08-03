window.config = {
    // Detectar si estamos en GitHub Pages o en local
    isGitHubPages: window.location.hostname.includes('github.io'),
    
    // URLs base
    baseUrl: window.location.hostname.includes('github.io') 
        ? 'https://cedenofofo.github.io/spotify-playlist'  // Para GitHub Pages
        : '',                  // Para desarrollo local
    
    // Configuración de Spotify
    clientId: '87cd9c6748524a58bc0e3151a3173e93',
    redirectUri: 'https://cedenofofo.github.io/spotify-playlist/index.html',
    
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