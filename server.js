const http = require('http')
const fs = require('fs')

const PORT = process.env.PORT || 9000
http
  .createServer((req, res) => {
  
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('index.html').pipe(res)
    // console.log('New connection')
    res.end('Serveri')
  })
  .listen(PORT, () => console.log('Listening on port ', PORT))
