const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle other routes and requests
// ...

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log('Listening on port ', PORT));
