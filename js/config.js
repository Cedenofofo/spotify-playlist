window.config = {
    // Detectar si estamos en GitHub Pages o en local
    isGitHubPages: window.location.hostname.includes('github.io'),
    
    // URLs base
    baseUrl: window.location.hostname.includes('github.io') 
        ? 'https://cedenofofo.github.io/spotify-playlist'  // Para GitHub Pages
        : '',                  // Para desarrollo local
    
    // Configuración de Spotify
    clientId: '87cd9c6748524a58bc0e3151a3173e93',
    clientSecret: '5c0c9086ef2a414d93e7e9385390053b',
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