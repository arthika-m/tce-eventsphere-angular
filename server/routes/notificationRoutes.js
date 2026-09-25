const express = require('express');

const router =
    express.Router();

const protect =
    require('../middleware/authMiddleware');

const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} =
    require('../controllers/notificationController');


// Get all notifications
router.get(
    '/',
    protect,
    getMyNotifications
);


// Get unread count
router.get(
    '/unread-count',
    protect,
    getUnreadCount
);


// Mark all as read
router.patch(
    '/read-all',
    protect,
    markAllAsRead
);


// Mark one as read
router.patch(
    '/:id/read',
    protect,
    markAsRead
);


// Delete notification
router.delete(
    '/:id',
    protect,
    deleteNotification
);


module.exports = router;