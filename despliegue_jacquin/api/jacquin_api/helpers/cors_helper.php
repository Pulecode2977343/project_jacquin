<?php
/**
 * CORS Helper
 * Handles Access-Control headers to allow credentials (cookies) in cross-site requests (zrok tunnel).
 */
function handleCors() {
    // Check if Origin header exists
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    } else {
        // Fallback for non-browser or tools where origin is not set
        // Note: 'credentials: include' with '*' is not allowed, so this fallback is mostly for public/testing without creds.
        // If we want to allow everything with credentials, we must echo the origin.
        // But for safety, let's default to * only if no origin.
        header("Access-Control-Allow-Origin: *");
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        exit(0);
    }
}
?>
