const http = require('http')
const PORT = process.env.PORT || 9000
http
  .createServer((req, res) => {
    console.log('New connection')
    res.end('Receptionist täällä')
  })
  .listen(PORT, () => console.log('Kuunnellaan ', PORT))
