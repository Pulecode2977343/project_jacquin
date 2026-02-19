/**
 * setupProxy.js — CRA HTTP Proxy Middleware
 * 
 * Cuando el frontend accede desde el túnel zrok (externo), el navegador
 * no puede llegar a localhost:8080 (XAMPP). Este proxy hace que el dev
 * server de Node actúe como intermediario:
 * 
 *   Browser (externo) → zrok tunnel → React DevServer (Node, local)
 *                                            ↓ proxy
 *                                      XAMPP localhost:8080
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/project_jacquin/jacquin_api',
        createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
            pathRewrite: {
                '^/': '/jacquin_api/', // Express corta el prefijo, lo reponemos apuntando a la carpeta correcta
            },
            onError: (err, req, res) => {
                console.error('[Proxy Error]', err.message);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Backend no disponible' }));
            }
        })
    );
};
