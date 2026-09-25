app.controller(
    'StudentNotificationsController',

    function (
        $scope,
        $location,
        NotificationService,
        AuthService
    ) {

        $scope.user =
            AuthService.currentUser();

        $scope.notifications = [];

        $scope.loading = true;

        $scope.errorMessage = '';

        $scope.successMessage = '';


        // Load notifications
        $scope.loadNotifications =
            function () {

                $scope.loading = true;

                $scope.errorMessage = '';

                NotificationService
                    .getNotifications()

                    .then(
                        function (response) {

                            if (
                                response &&
                                response.success
                            ) {

                                $scope.notifications =
                                    response.notifications ||
                                    [];

                            } else {

                                $scope.errorMessage =
                                    (
                                        response &&
                                        response.message
                                    ) ||
                                    'Unable to load notifications.';
                            }
                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Notifications Error:',
                                error
                            );

                            $scope.errorMessage =
                                (
                                    error.data &&
                                    error.data.message
                                ) ||
                                'Unable to load notifications.';
                        }
                    )

                    .finally(
                        function () {

                            $scope.loading =
                                false;
                        }
                    );
            };


        // Mark one as read
        $scope.markAsRead =
            function (notification) {

                if (
                    !notification ||
                    !notification._id
                ) {
                    return;
                }

                NotificationService
                    .markAsRead(
                        notification._id
                    )

                    .then(
                        function () {

                            notification.isRead =
                                true;
                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Mark Read Error:',
                                error
                            );
                        }
                    );
            };


        // Mark all as read
        $scope.markAllAsRead =
            function () {

                NotificationService
                    .markAllAsRead()

                    .then(
                        function (response) {

                            if (
                                response &&
                                response.success
                            ) {

                                $scope.notifications
                                    .forEach(
                                        function (
                                            notification
                                        ) {

                                            notification.isRead =
                                                true;
                                        }
                                    );

                                $scope.successMessage =
                                    'All notifications marked as read.';
                            }
                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Mark All Read Error:',
                                error
                            );
                        }
                    );
            };


        // Delete notification
        $scope.deleteNotification =
            function (notification) {

                if (
                    !notification ||
                    !notification._id
                ) {
                    return;
                }

                NotificationService
                    .deleteNotification(
                        notification._id
                    )

                    .then(
                        function (response) {

                            if (
                                response &&
                                response.success
                            ) {

                                const index =
                                    $scope.notifications
                                        .indexOf(
                                            notification
                                        );

                                if (
                                    index !== -1
                                ) {

                                    $scope.notifications
                                        .splice(
                                            index,
                                            1
                                        );
                                }
                            }
                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Delete Notification Error:',
                                error
                            );
                        }
                    );
            };


        // Open related event
        $scope.openNotification =
            function (notification) {

                if (
                    !notification
                ) {
                    return;
                }

                $scope.markAsRead(
                    notification
                );

                if (
                    notification.eventId
                ) {

                    const eventId =
                        typeof notification.eventId ===
                        'object'
                            ? notification.eventId._id
                            : notification.eventId;

                    $location.path(
                        '/student/event/' +
                        eventId
                    );
                }
            };


        // Format notification date
        $scope.formatDate =
            function (date) {

                if (!date) {
                    return '-';
                }

                const parsedDate =
                    new Date(date);

                if (
                    isNaN(
                        parsedDate.getTime()
                    )
                ) {
                    return '-';
                }

                return parsedDate.toLocaleDateString(
                    'en-IN',
                    {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }
                );
            };


        // Format notification time
        $scope.formatTime =
            function (date) {

                if (!date) {
                    return '';
                }

                const parsedDate =
                    new Date(date);

                if (
                    isNaN(
                        parsedDate.getTime()
                    )
                ) {
                    return '';
                }

                return parsedDate.toLocaleTimeString(
                    'en-IN',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );
            };


        // Notification icon
        $scope.getNotificationIcon =
            function (type) {

                switch (type) {

                    case 'event':
                        return 'fa-calendar-days';

                    case 'registration':
                        return 'fa-ticket';

                    case 'announcement':
                        return 'fa-bullhorn';

                    default:
                        return 'fa-bell';
                }
            };


        $scope.loadNotifications();
    }
);