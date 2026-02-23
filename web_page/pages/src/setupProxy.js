/**
 * setupProxy.js — CRA HTTP Proxy Middleware
 *
 * Browser (externo) → zrok → React DevServer (:3000) → XAMPP (:8080)
 *
 * IMPORTANTE: No usar app.use('/prefix', createProxyMiddleware) porque Express
 * elimina el prefijo de req.url antes de que llegue al proxy.
 * Se usa pathFilter dentro de createProxyMiddleware para que el proxy
 * reciba la URL completa y la reenvíe correctamente a XAMPP.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware({
            target: 'http://127.0.0.1:8080',
            changeOrigin: true,
            pathFilter: '/jacquin_api',
            onError: (err, req, res) => {
                console.error('[Proxy Error]', err.message);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Backend no disponible (XAMPP)' }));
            }
        })
    );
};
