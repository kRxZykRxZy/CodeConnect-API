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

app.all(/.*/, async (req, res) => {
    const urlPath = req.path.split('/').filter(Boolean);

    const route = urlPath[0] || "base";
    const subPath = urlPath.slice(1).join('/');

    // Extract numeric segments
    const numberParams = urlPath
        .map(s => Number(s))
        .filter(n => !isNaN(n))
        .replace("[", "")
        .replace("]", "");

    try {
        let modulePath;

        // Case 1: single segment → use base ROUTE file
        if (urlPath.length === 1) {
            modulePath = path.join(__dirname, '..', 'routes', 'base', route);
        }

        // Case 2: contains numbers → use id handler
        else if (numberParams.length > 0) {
            modulePath = path.join(__dirname, '..', 'routes', route, 'id');
        }

        // Case 3: multi segments, no numbers → load real subpath
        else {
            modulePath = path.join(__dirname, '..', 'routes', route, subPath);
        }

        // Load the module
        const { main } = require(modulePath);

        if (typeof main === 'function') {
            req.numberParams = numberParams;
            req.route = route;
            await main(req, res);
        } else {
            res.status(500).send('Main function not found in the module.');
        }

    } catch (error) {
        res.status(500).json({
            error: error.message,
            route,
            numberParams,
            attemptedPath: req.path
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
