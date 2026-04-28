const express = require('express');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/stream', (req, res) => {
  const socket = net.createConnection(30032, '78.129.132.7', () => { 
    socket.write(
      'GET /stream HTTP/1.0\r\n' +
      'Host: 78.129.132.7:30032\r\n' +
      'User-Agent: WinampMPEG/5.66\r\n' +
      'Accept: audio/mpeg, audio/*, */*\r\n' +
      'Icy-MetaData: 0\r\n' +
      'Connection: close\r\n' +
      '\r\n'
    );
  });

  let headersParsed = false;
  let buffer = Buffer.alloc(0);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-cache');

  socket.on('data', (chunk) => {
    if (!headersParsed) {
      buffer = Buffer.concat([buffer, chunk]);
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        headersParsed = true;
        const audioData = buffer.slice(headerEnd + 4);
        if (audioData.length > 0) res.write(audioData);
      }
    } else {
      res.write(chunk);
    }
  });

  socket.on('end', () => res.end());
  socket.on('error', (err) => {
    if (!res.headersSent) res.status(502).send(`Erreur : ${err.message}`);
    else res.end();
  });

  req.on('close', () => socket.destroy());
});

app.get('/', (req, res) => res.send('Proxy Icecast actif ✓'));
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));