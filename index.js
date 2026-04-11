const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const STREAM_URL = 'http://95.154.197.82:10213';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/stream', createProxyMiddleware({
  target: STREAM_URL,
  changeOrigin: true,
  // ← Le ";" Shoutcast est ici
  pathRewrite: { '^/stream': '/;' },
  selfHandleResponse: false,
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('User-Agent', 'WinampMPEG/5.66');
      proxyReq.setHeader('Accept', 'audio/mpeg, audio/*, */*');
      proxyReq.setHeader('Icy-MetaData', '1');
      proxyReq.setHeader('Connection', 'keep-alive');
    },
    proxyRes: (proxyRes) => {
      // Force les headers Shoutcast à passer
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['content-type'] = 'audio/mpeg';
      proxyRes.headers['cache-control'] = 'no-cache';
    },
    error: (err, req, res) => {
      res.status(502).send(`Erreur proxy : ${err.message}`);
    },
  },
}));

app.get('/', (req, res) => res.send('Proxy Shoutcast actif ✓'));
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));