const PROXY_CONFIG = [
  {
    context: [
      "/api/**"
    ],
    target: "http://localhost:8080",
    secure: false,
    logLevel: "debug",
    changeOrigin: true,
    headers: {
      "Connection": "keep-alive"
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log de la requête pour le débogage
      console.log('Proxying request to:', req.originalUrl);
      // Ajouter des en-têtes CORS si nécessaire
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    },
    onError: (err, req, res) => {
      console.error('Erreur de proxy:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        message: 'Erreur de proxy',
        error: err.message
      }));
    }
  }
];

module.exports = PROXY_CONFIG;
