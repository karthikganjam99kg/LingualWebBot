const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Import the 'body-parser' module
const app = express();
const PORT = 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});