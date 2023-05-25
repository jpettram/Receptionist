const http = require('http')
const PORT = process.env.PORT || 9000
http
  .createServer((req, res) => {
    console.log('New connection')
    res.end('Receptionist backend')
  })
  .listen(PORT, () => console.log('Serveri kuulee ', PORT))
