const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

app.all('/:route/*', (req, res) => {
    const route = req.params.route; 
    const subPath = req.params[0]; // catches everything after the first segment

    // Fix precedence to load the correct file
    const modulePath = '../routes/' + route + (subPath ? `/${subPath}` : '');
    
    try {
        const { main } = require(modulePath);
        if (typeof main === 'function') {
            main(req, res);
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