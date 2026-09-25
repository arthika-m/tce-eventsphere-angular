const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        // ----------------------------------------------
        // Check Authorization header
        // ----------------------------------------------

        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'Authentication required.'

            });

        }


        // ----------------------------------------------
        // Extract token
        // ----------------------------------------------

        const token =
            authHeader.split(' ')[1];


        // ----------------------------------------------
        // Verify token
        // ----------------------------------------------

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ----------------------------------------------
        // Store user information in request
        // ----------------------------------------------

        req.user = decoded;


        next();

    } catch (error) {

        console.error(
            'Authentication Error:',
            error.message
        );

        return res.status(401).json({

            success: false,

            message:
                'Invalid or expired authentication token.'

        });

    }
};


module.exports = protect;