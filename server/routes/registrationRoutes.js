const express = require('express');

const router = express.Router();


// ============================================================
// MIDDLEWARE
// ============================================================

// authMiddleware exports protect directly
const protect =
    require('../middleware/authMiddleware');

// roleMiddleware exports authorizeRoles
// as an object property
const {
    authorizeRoles
} =
    require('../middleware/roleMiddleware');


// ============================================================
// CONTROLLERS
// ============================================================

const {

    registerForEvent,

    confirmExternalRegistration,

    getMyRegistrations,

    getEventParticipants,

    updateAttendance,

    cancelRegistration

} =
    require('../controllers/registrationController');


// ============================================================
// STUDENT ROUTES
// ============================================================


// ------------------------------------------------------------
// REGISTER FOR NORMAL EVENT
// POST /api/registrations
// ------------------------------------------------------------

router.post(

    '/',

    protect,

    authorizeRoles('student'),

    registerForEvent

);


// ------------------------------------------------------------
// CONFIRM EXTERNAL REGISTRATION
// POST /api/registrations/external/:eventId
// ------------------------------------------------------------
//
// Student first registers through the external website.
// Then clicks "I Registered Externally" in EventSphere.
//
// No additional form is required.
// ------------------------------------------------------------

router.post(

    '/external/:eventId',

    protect,

    authorizeRoles('student'),

    confirmExternalRegistration

);


// ------------------------------------------------------------
// GET LOGGED-IN STUDENT REGISTRATIONS
// GET /api/registrations/my
// ------------------------------------------------------------

router.get(

    '/my',

    protect,

    authorizeRoles('student'),

    getMyRegistrations

);


// ------------------------------------------------------------
// CANCEL STUDENT REGISTRATION
// DELETE /api/registrations/:id
// ------------------------------------------------------------

router.delete(

    '/:id',

    protect,

    authorizeRoles('student'),

    cancelRegistration

);


// ============================================================
// COORDINATOR ROUTES
// ============================================================


// ------------------------------------------------------------
// GET PARTICIPANTS OF AN EVENT
// GET /api/registrations/event/:eventId
// ------------------------------------------------------------

router.get(

    '/event/:eventId',

    protect,

    authorizeRoles('coordinator'),

    getEventParticipants

);


// ------------------------------------------------------------
// UPDATE PARTICIPANT ATTENDANCE
// PATCH /api/registrations/:id/attendance
// ------------------------------------------------------------

router.patch(

    '/:id/attendance',

    protect,

    authorizeRoles('coordinator'),

    updateAttendance

);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports =
    router;