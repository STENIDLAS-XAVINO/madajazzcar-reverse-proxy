const express = require('express');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/stream', (req, res) => {
  const socket = net.createConnection(10213, '95.154.197.82', () => {
    console.log('✓ Connecté au serveur Shoutcast');
    socket.write(
      'GET /; HTTP/1.0\r\n' +
      'Host: 95.154.197.82:10213\r\n' +
      'User-Agent: WinampMPEG/5.66\r\n' +
      'Accept: audio/mpeg, audio/*, */*\r\n' +
      'Icy-MetaData: 0\r\n' +
      'Connection: close\r\n' +
      '\r\n'
    );
  });

  let headersParsed = false;
  let buffer = Buffer.alloc(0);
  let totalBytes = 0;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-cache');

  socket.on('data', (chunk) => {
    if (!headersParsed) {
      buffer = Buffer.concat([buffer, chunk]);
      const headerEnd = buffer.indexOf('\r\n\r\n');

      if (headerEnd !== -1) {
        // Affiche les headers bruts dans les logs Render
        const rawHeaders = buffer.slice(0, headerEnd).toString();
        console.log('=== HEADERS REÇUS ===');
        console.log(rawHeaders);
        console.log('=====================');

        headersParsed = true;
        const audioData = buffer.slice(headerEnd + 4);
        console.log(`Premier chunk audio : ${audioData.length} bytes`);
        if (audioData.length > 0) res.write(audioData);
      }
    } else {
      totalBytes += chunk.length;
      console.log(`Audio reçu : ${totalBytes} bytes total`);
      res.write(chunk);
    }
  });

  socket.on('end', () => {
    console.log('Connexion fermée par le serveur');
    res.end();
  });

  socket.on('error', (err) => {
    console.error('Erreur socket :', err.message);
    if (!res.headersSent) {
      res.status(502).send(`Erreur : ${err.message}`);
    } else {
      res.end();
    }
  });

  req.on('close', () => {
    console.log('Client déconnecté');
    socket.destroy();
  });
});

app.get('/', (req, res) => res.send('Proxy Shoutcast actif ✓'));
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));