const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/stream', (req, res) => {
  const options = {
    hostname: '95.154.197.82',
    port: 10213,
    path: '/;',
    method: 'GET',
    headers: {
      'User-Agent': 'WinampMPEG/5.66',
      'Accept': 'audio/mpeg, audio/*, */*',
      'Icy-MetaData': '1',
      'Connection': 'keep-alive',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    });

    proxyRes.pipe(res);

    proxyRes.on('error', (err) => {
      console.error('Erreur flux :', err.message);
      res.end();
    });
  });

  proxyReq.on('error', (err) => {
    console.error('Erreur connexion :', err.message);
    res.status(502).send(`Erreur : ${err.message}`);
  });

  proxyReq.end();
});

app.get('/', (req, res) => res.send('Proxy Shoutcast actif ✓'));
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));