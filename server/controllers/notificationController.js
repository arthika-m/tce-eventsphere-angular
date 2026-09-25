const Notification =
    require('../models/Notification');


// Get notifications for logged-in user
const getMyNotifications =
    async (req, res) => {
        try {
            const notifications =
                await Notification
                    .find({
                        userId: req.user.id
                    })
                    .sort({
                        createdAt: -1
                    });

            const unreadCount =
                await Notification.countDocuments({
                    userId: req.user.id,
                    isRead: false
                });

            res.status(200).json({
                success: true,
                notifications,
                unreadCount
            });

        } catch (error) {
            console.error(
                'Get Notifications Error:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to load notifications.'
            });
        }
    };


// Get unread notification count
const getUnreadCount =
    async (req, res) => {
        try {
            const unreadCount =
                await Notification.countDocuments({
                    userId: req.user.id,
                    isRead: false
                });

            res.status(200).json({
                success: true,
                unreadCount
            });

        } catch (error) {
            console.error(
                'Unread Count Error:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to get unread notification count.'
            });
        }
    };


// Mark one notification as read
const markAsRead =
    async (req, res) => {
        try {
            const notification =
                await Notification.findOne({
                    _id: req.params.id,
                    userId: req.user.id
                });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Notification not found.'
                });
            }

            notification.isRead = true;

            await notification.save();

            res.status(200).json({
                success: true,
                message:
                    'Notification marked as read.',
                notification
            });

        } catch (error) {
            console.error(
                'Mark Notification Error:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to update notification.'
            });
        }
    };


// Mark all notifications as read
const markAllAsRead =
    async (req, res) => {
        try {
            await Notification.updateMany(
                {
                    userId: req.user.id,
                    isRead: false
                },
                {
                    $set: {
                        isRead: true
                    }
                }
            );

            res.status(200).json({
                success: true,
                message:
                    'All notifications marked as read.'
            });

        } catch (error) {
            console.error(
                'Mark All Notifications Error:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to update notifications.'
            });
        }
    };


// Delete notification
const deleteNotification =
    async (req, res) => {
        try {
            const notification =
                await Notification.findOneAndDelete({
                    _id: req.params.id,
                    userId: req.user.id
                });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Notification not found.'
                });
            }

            res.status(200).json({
                success: true,
                message:
                    'Notification deleted successfully.'
            });

        } catch (error) {
            console.error(
                'Delete Notification Error:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to delete notification.'
            });
        }
    };


module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};