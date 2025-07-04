<?php
// Asegurarse de que estamos en modo debug para ver errores
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Si hay una sesión activa, la cerramos para poder reconfigurarla
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

// Configuración de sesiones
ini_set('session.gc_maxlifetime', 3600); // 1 hora
ini_set('session.cookie_lifetime', 3600); // 1 hora
ini_set('session.cookie_secure', 0);
ini_set('session.cookie_httponly', 1);
session_save_path(__DIR__ . '/sessions');
session_set_cookie_params(3600);

// Iniciamos la sesión
session_start();

// Configuración de Spotify
define('SPOTIFY_CLIENT_ID', '87cd9c6748524a58bc0e3151a3173e93');
define('SPOTIFY_CLIENT_SECRET', '5c0c9086ef2a414d93e7e9385390053b');
define('SPOTIFY_REDIRECT_URI', 'https://cedenofofo.github.io/spotify-playlist/callback.html');

// URLs de la API de Spotify
define('SPOTIFY_API_URL', 'https://api.spotify.com/v1');
define('SPOTIFY_AUTH_URL', 'https://accounts.spotify.com/authorize');

// Claves de sesión
define('SPOTIFY_SESSION_STATE_KEY', 'spotify_auth_state');
define('SPOTIFY_SESSION_TOKEN_KEY', 'spotify_access_token');
define('SPOTIFY_SESSION_REFRESH_TOKEN_KEY', 'spotify_refresh_token');

// Scopes de la API
define('SPOTIFY_SCOPES', 'playlist-modify-public playlist-modify-private user-read-private');

// Configuración de la aplicación
define('APP_URL', 'https://cedenofofo.github.io/spotify-playlist');
define('DEBUG_MODE', true);

// Configuración adicional de seguridad
define('SPOTIFY_STATE_LENGTH', 16);

// Función para generar un estado seguro
function generateSpotifyState() {
    $state = bin2hex(random_bytes(SPOTIFY_STATE_LENGTH));
    $_SESSION[SPOTIFY_SESSION_STATE_KEY] = $state;
    return $state;
}

// Función para validar el estado
function validateSpotifyState($state) {
    return isset($_SESSION[SPOTIFY_SESSION_STATE_KEY]) &&
           $state === $_SESSION[SPOTIFY_SESSION_STATE_KEY];
}

// Función para obtener la URI de redirección actual
function getCurrentRedirectUri() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    return $protocol . '://' . $host . '/spotify-playlist/callback.php';
}

// Función para verificar y refrescar el token si es necesario
function checkAndRefreshToken() {
    if (!isset($_SESSION[SPOTIFY_SESSION_TOKEN_KEY])) {
        return false;
    }

    // Si el token está por expirar (menos de 5 minutos), refrescarlo
    if (isset($_SESSION['token_expires']) && $_SESSION['token_expires'] - time() < 300) {
        if (isset($_SESSION[SPOTIFY_SESSION_REFRESH_TOKEN_KEY])) {
            try {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'https://accounts.spotify.com/api/token');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $_SESSION[SPOTIFY_SESSION_REFRESH_TOKEN_KEY],
                    'client_id' => SPOTIFY_CLIENT_ID,
                    'client_secret' => SPOTIFY_CLIENT_SECRET
                ]));

                $response = curl_exec($ch);
                $data = json_decode($response, true);
                curl_close($ch);

                if (isset($data['access_token'])) {
                    $_SESSION[SPOTIFY_SESSION_TOKEN_KEY] = $data['access_token'];
                    $_SESSION['token_expires'] = time() + $data['expires_in'];
                    if (isset($data['refresh_token'])) {
                        $_SESSION[SPOTIFY_SESSION_REFRESH_TOKEN_KEY] = $data['refresh_token'];
                    }
                    return true;
                }
            } catch (Exception $e) {
                error_log("Error refreshing token: " . $e->getMessage());
            }
        }
    }
    return true;
}

// Verificar el token al cargar la configuración
checkAndRefreshToken();
?> 