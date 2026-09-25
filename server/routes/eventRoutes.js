const express = require('express');

const router = express.Router();


const {

    createEvent,

    getEvents,

    getStudentDashboardEvents,

    getStudentDepartmentEvents,

    getStudentCollegeEvents,

    getEventById,

    updateEvent,

    deleteEvent

} = require('../controllers/eventController');


// ============================================================
// MIDDLEWARE
// ============================================================

// authMiddleware exports protect directly
const protect =
    require('../middleware/authMiddleware');


// roleMiddleware exports authorizeRoles
const {
    authorizeRoles
} = require('../middleware/roleMiddleware');


// ============================================================
// STUDENT EVENT ROUTES
// ============================================================


// ------------------------------------------------------------
// STUDENT DASHBOARD EVENTS
// GET /api/events/student/dashboard
// ------------------------------------------------------------

router.get(

    '/student/dashboard',

    protect,

    authorizeRoles('student'),

    getStudentDashboardEvents

);


// ------------------------------------------------------------
// STUDENT DEPARTMENT EVENTS
// GET /api/events/student/department
// ------------------------------------------------------------

router.get(

    '/student/department',

    protect,

    authorizeRoles('student'),

    getStudentDepartmentEvents

);


// ------------------------------------------------------------
// STUDENT COLLEGE-WIDE EVENTS
// GET /api/events/student/college
// ------------------------------------------------------------

router.get(

    '/student/college',

    protect,

    authorizeRoles('student'),

    getStudentCollegeEvents

);


// ============================================================
// GENERAL EVENT ROUTES
// ============================================================


// ------------------------------------------------------------
// GET ALL EVENTS
// GET /api/events
//
// Used mainly by coordinator-side pages.
// ------------------------------------------------------------

router.get(

    '/',

    protect,

    getEvents

);


// ------------------------------------------------------------
// GET SINGLE EVENT
// GET /api/events/:id
// ------------------------------------------------------------

router.get(

    '/:id',

    protect,

    getEventById

);


// ============================================================
// COORDINATOR ROUTES
// ============================================================


// ------------------------------------------------------------
// CREATE EVENT
// POST /api/events
// ------------------------------------------------------------

router.post(

    '/',

    protect,

    authorizeRoles('coordinator'),

    createEvent

);


// ------------------------------------------------------------
// UPDATE EVENT
// PUT /api/events/:id
// ------------------------------------------------------------

router.put(

    '/:id',

    protect,

    authorizeRoles('coordinator'),

    updateEvent

);


// ------------------------------------------------------------
// DELETE EVENT
// DELETE /api/events/:id
// ------------------------------------------------------------

router.delete(

    '/:id',

    protect,

    authorizeRoles('coordinator'),

    deleteEvent

);


module.exports = router;