const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ICECAST_URL = 'http://78.129.132.7:30032/stream';

app.options('/stream', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.sendStatus(204);
});

app.get('/stream', async (req, res) => {
  try {
    const response = await fetch(ICECAST_URL, {
      headers: {
        'User-Agent': 'WinampMPEG/5.66',
        'Accept': 'audio/mpeg, audio/*, */*',
        'Icy-MetaData': '1',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`Source indisponible : ${response.status}`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache');

    // Pipe direct du flux vers le client
    const reader = response.body.getReader();
    
    req.on('close', () => reader.cancel());

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || res.destroyed) break;
          res.write(value);
        }
      } catch (e) {
        // Client déconnecté, normal
      } finally {
        res.end();
      }
    };

    pump();

  } catch (e) {
    if (!res.headersSent) res.status(502).send(`Erreur : ${e.message}`);
  }
});

app.get('/', (req, res) => res.send('Proxy Icecast actif ✓'));
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));