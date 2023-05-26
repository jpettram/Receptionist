const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 9000;

http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream('typer.html').pipe(res);
  } else if (req.url.endsWith('.js')) {
    const filePath = path.join(__dirname, req.url);
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    fs.createReadStream(filePath).pipe(res);
  } else if (req.url.endsWith('.html')) {
    const filePath = path.join(__dirname, req.url);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(filePath).pipe(res);    
  } else if (req.url.endsWith('.css')) {
    const filePath = path.join(__dirname, req.url);
    res.writeHead(200, { 'Content-Type': 'text/css' });
    fs.createReadStream(filePath).pipe(res);      
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
  console.log('New connection');
}).listen(PORT, () => console.log('Listening on port', PORT));
