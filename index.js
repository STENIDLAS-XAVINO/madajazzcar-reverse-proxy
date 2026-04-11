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
  pathRewrite: { '^/stream': '/;' },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('User-Agent', 'WinampMPEG/5.66');
      proxyReq.setHeader('Accept', 'audio/mpeg, audio/*, */*');
      proxyReq.setHeader('Icy-MetaData', '1');
    },
  },
}));

app.get('/', (req, res) => res.send('Proxy actif ✓'));
app.listen(PORT, () => console.log(`Port ${PORT}`));