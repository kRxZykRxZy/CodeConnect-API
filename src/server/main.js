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

    // Extract the first numeric segment
    const firstNumberParam = urlPath
        .map(s => Number(s))
        .find(n => !isNaN(n));

    try {
        let modulePath;

        // Case 1: single segment → use base ROUTE file
        if (urlPath.length === 1) {
            modulePath = path.join(__dirname, '..', 'routes', 'base', route);
        }

        // Case 2: contains a number → use id handler
        else if (firstNumberParam !== undefined) {
            modulePath = path.join(__dirname, '..', 'routes', route, 'id');
        }

        // Case 3: multi segments, no numbers → load real subpath
        else {
            modulePath = path.join(__dirname, '..', 'routes', route, subPath);
        }

        // Load the module
        const { main } = require(modulePath);

        if (typeof main === 'function') {
            req.numberParam = firstNumberParam; // store single number
            req.route = route;
            await main(req, res);
        } else {
            res.status(500).send('Main function not found in the module.');
        }

    } catch (error) {
        res.status(500).json({
            error: error.message,
            route,
            numberParam: firstNumberParam,
            attemptedPath: req.path
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
