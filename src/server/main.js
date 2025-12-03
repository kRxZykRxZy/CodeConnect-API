const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.all('/:route/*', async (req, res) => {
    const route = req.params.route; 
    const subPath = req.params[0] || ''; // catches everything after /:route/

    // Build module path safely
    let modulePath = path.join(__dirname, '..', 'routes', route, subPath);

    try {
        // If subPath contains a number, load the "id" module
        if (/\d/.test(subPath)) {
            modulePath = path.join(__dirname, '..', 'routes', route, 'id');
        }

        const { main } = require(modulePath);

        if (typeof main === 'function') {
            await main(req, res);
        } else {
            res.status(500).send('Main function not found in the module.');
        }
    } catch (error) {
        res.status(500).send(`Error loading module: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});