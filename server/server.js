const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');


// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================

dotenv.config();


// ============================================================
// DATABASE
// ============================================================

const connectDB = require('./config/db');


// ============================================================
// ROUTES
// ============================================================

const authRoutes =
    require('./routes/authRoutes');

const eventRoutes =
    require('./routes/eventRoutes');

const registrationRoutes =
    require('./routes/registrationRoutes');

const notificationRoutes =
    require('./routes/notificationRoutes');

const odRoutes =
    require('./routes/odRoutes');


// ============================================================
// APP
// ============================================================

const app = express();


// ============================================================
// CONNECT MONGODB
// ============================================================

connectDB();


// ============================================================
// MIDDLEWARE
// ============================================================

// Allow frontend requests

app.use(
    cors()
);


// Parse JSON request bodies

app.use(
    express.json()
);


// Parse form data

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================================
// STATIC CLIENT FILES
// ============================================================

// Serve AngularJS client files

app.use(
    express.static(
        path.join(
            __dirname,
            '..',
            'client'
        )
    )
);


// ============================================================
// API ROUTES
// ============================================================


// ------------------------------------------------------------
// AUTHENTICATION
// ------------------------------------------------------------

app.use(
    '/api/auth',
    authRoutes
);


// ------------------------------------------------------------
// EVENTS
// ------------------------------------------------------------

app.use(
    '/api/events',
    eventRoutes
);


// ------------------------------------------------------------
// REGISTRATIONS
// ------------------------------------------------------------

app.use(
    '/api/registrations',
    registrationRoutes
);


// ------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------

app.use(
    '/api/notifications',
    notificationRoutes
);


// ------------------------------------------------------------
// OD MANAGEMENT
// ------------------------------------------------------------

// Upload signed OD PDF
// Get OD information
// Download / view OD PDF
// Get student's available OD documents

app.use(
    '/api/od',
    odRoutes
);


// ============================================================
// TEST API
// ============================================================

app.get(
    '/api/test',
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                'TCE EventSphere API is working.',

            timestamp:
                new Date()

        });

    }
);


// ============================================================
// FRONTEND FALLBACK
// ============================================================

// AngularJS uses client-side routing.
// If a normal page route is requested,
// return index.html.

app.get(
    '*',
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                '..',
                'client',
                'index.html'
            )
        );

    }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            'Server Error:',
            err
        );


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                'Internal server error.'

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            '================================================'
        );

        console.log(
            '   TCE EventSphere Server'
        );

        console.log(
            '================================================'
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            '================================================'
        );

    }
);