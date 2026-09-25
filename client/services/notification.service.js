app.service(
    'NotificationService',
    function ($http) {

        const API =
            '/api/notifications';


        // Get all notifications
        this.getNotifications =
            function () {

                return $http.get(API)
                    .then(
                        function (response) {
                            return response.data;
                        }
                    );
            };


        // Get unread count
        this.getUnreadCount =
            function () {

                return $http.get(
                    API + '/unread-count'
                )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    );
            };


        // Mark one notification as read
        this.markAsRead =
            function (id) {

                return $http.patch(
                    API + '/' +
                    id +
                    '/read'
                )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    );
            };


        // Mark all notifications as read
        this.markAllAsRead =
            function () {

                return $http.patch(
                    API + '/read-all'
                )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    );
            };


        // Delete notification
        this.deleteNotification =
            function (id) {

                return $http.delete(
                    API + '/' + id
                )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    );
            };
    }
);