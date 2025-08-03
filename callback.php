<?php
require_once 'config.php';

// Verificar que tenemos el código y el estado
if (!isset($_GET['code']) || !isset($_GET['state'])) {
    die('Error: Missing required parameters');
}

// Validar el estado
if (!validateSpotifyState($_GET['state'])) {
    die('Error: Invalid state parameter');
}

// Intercambiar el código por un token de acceso
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://accounts.spotify.com/api/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'authorization_code',
    'code' => $_GET['code'],
    'redirect_uri' => SPOTIFY_REDIRECT_URI,
    'client_id' => SPOTIFY_CLIENT_ID,
    'client_secret' => SPOTIFY_CLIENT_SECRET
]));

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

if (isset($data['access_token'])) {
    // Guardar el token en la sesión
    $_SESSION[SPOTIFY_SESSION_TOKEN_KEY] = $data['access_token'];
    $_SESSION['token_expires'] = time() + $data['expires_in'];
    
    if (isset($data['refresh_token'])) {
        $_SESSION[SPOTIFY_SESSION_REFRESH_TOKEN_KEY] = $data['refresh_token'];
    }

    // Redirigir al dashboard con los datos necesarios
    $redirectUrl = APP_URL . '/dashboard.html?access_token=' . $data['access_token'] . 
                  '&expires_in=' . $data['expires_in'];
    header('Location: ' . $redirectUrl);
    exit;
} else {
    die('Error: Failed to get access token');
}
?> 