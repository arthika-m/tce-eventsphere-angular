const express = require('express');

const {
    registerStudent,
    login,
    getMe
} = require('../controllers/authController');

const protect =
    require('../middleware/authMiddleware');


const router = express.Router();


// ======================================================
// STUDENT REGISTRATION
// ======================================================

router.post(
    '/register',
    registerStudent
);


// ======================================================
// LOGIN
// ======================================================

router.post(
    '/login',
    login
);


// ======================================================
// CURRENT USER
// ======================================================

router.get(
    '/me',
    protect,
    getMe
);


module.exports = router;