app.controller(
    'StudentDashboardController',

    function (
        $scope,
        $location,
        AuthService,
        EventService,
        NotificationService
    ) {


        // =====================================================
        // CURRENT USER
        // =====================================================

        $scope.user =
            AuthService.currentUser();


        // =====================================================
        // TWO-WAY DATA BINDING NAME
        // =====================================================

        /*
         * This variable is connected to the textbox
         * using ng-model="dashboardName".
         *
         * Whatever the student types in the textbox
         * is immediately reflected in:
         *
         * {{ dashboardName }}
         *
         * This demonstrates AngularJS two-way
         * data binding.
         */

        $scope.dashboardName =
            $scope.user
                ? $scope.user.name
                : '';


        // =====================================================
        // VARIABLES
        // =====================================================

        $scope.events =
            [];

        $scope.loadingEvents =
            true;

        $scope.error =
            '';


        // =====================================================
        // NOTIFICATION COUNT
        // =====================================================

        $scope.notificationCount =
            0;

        $scope.loadingNotifications =
            true;


        // =====================================================
        // LOAD DASHBOARD EVENTS
        // =====================================================

        $scope.loadEvents =
            function () {

                $scope.loadingEvents =
                    true;

                $scope.error =
                    '';


                EventService
                    .getStudentDashboardEvents()

                    .then(
                        function (response) {

                            console.log(
                                'Student Dashboard Events:',
                                response
                            );


                            if (
                                response &&
                                response.success
                            ) {

                                $scope.events =
                                    response.events ||
                                    [];

                            } else {

                                $scope.events =
                                    [];

                                $scope.error =
                                    (
                                        response &&
                                        response.message
                                    ) ||
                                    'Unable to load events.';

                            }

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Dashboard Events Error:',
                                error
                            );


                            $scope.events =
                                [];

                            $scope.error =

                                error.data &&
                                error.data.message

                                    ? error.data.message

                                    : 'Unable to load events.';

                        }
                    )

                    .finally(
                        function () {

                            $scope.loadingEvents =
                                false;

                        }
                    );

            };


        // =====================================================
        // LOAD NOTIFICATION COUNT
        // =====================================================

        $scope.loadNotificationCount =
            function () {

                $scope.loadingNotifications =
                    true;


                NotificationService
                    .getUnreadCount()

                    .then(
                        function (response) {

                            console.log(
                                'Unread Notification Count:',
                                response
                            );


                            if (
                                response &&
                                response.success
                            ) {

                                $scope.notificationCount =
                                    Number(
                                        response.unreadCount ||
                                        0
                                    );

                            } else {

                                $scope.notificationCount =
                                    0;

                            }

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Notification Count Error:',
                                error
                            );


                            $scope.notificationCount =
                                0;

                        }
                    )

                    .finally(
                        function () {

                            $scope.loadingNotifications =
                                false;

                        }
                    );

            };


        // =====================================================
        // VIEW NOTIFICATIONS
        // =====================================================

        $scope.viewNotifications =
            function () {

                $location.path(
                    '/student/notifications'
                );

            };


        // =====================================================
        // VIEW EVENT
        // =====================================================

        $scope.viewEvent =
            function (event) {

                if (
                    !event ||
                    !event._id
                ) {

                    return;

                }


                $location.path(

                    '/student/event/' +
                    event._id

                );

            };


        // =====================================================
        // TIME FORMAT
        // =====================================================

        $scope.formatTime =
            function (time) {

                if (!time) {

                    return '';

                }


                if (
                    typeof time === 'string' &&
                    time.includes(':')
                ) {

                    const parts =
                        time.split(':');


                    let hour =
                        parseInt(
                            parts[0],
                            10
                        );


                    const minute =
                        parts[1] ||
                        '00';


                    const period =
                        hour >= 12
                            ? 'PM'
                            : 'AM';


                    hour =
                        hour % 12 ||
                        12;


                    return (
                        hour +
                        ':' +
                        minute +
                        ' ' +
                        period
                    );

                }


                const date =
                    new Date(time);


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return '';

                }


                return date.toLocaleTimeString(
                    'en-IN',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            };


        // =====================================================
        // DATE FORMAT
        // =====================================================

        $scope.formatDate =
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


                return parsedDate.toLocaleDateString(
                    'en-IN',
                    {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }
                );

            };


        // =====================================================
        // CATEGORY ICON
        // =====================================================

        $scope.getCategoryIcon =
            function (category) {

                const icons = {

                    'Technical':
                        'fa-laptop-code',

                    'Workshop':
                        'fa-tools',

                    'Seminar':
                        'fa-chalkboard-teacher',

                    'Sports':
                        'fa-running',

                    'Cultural':
                        'fa-theater-masks',

                    'Placement':
                        'fa-briefcase',

                    'NSS':
                        'fa-hands-helping',

                    'NCC':
                        'fa-shield-alt',

                    'YRC':
                        'fa-heart'

                };


                return (

                    icons[category] ||

                    'fa-calendar-days'

                );

            };


        // =====================================================
        // SEAT PERCENTAGE
        // =====================================================

        $scope.getSeatPercentage =
            function (event) {

                if (
                    !event ||
                    event.unlimitedSeats ||
                    !event.maxSeats
                ) {

                    return 0;

                }


                const registered =
                    Number(
                        event.registeredSeats ||
                        0
                    );


                const maximum =
                    Number(
                        event.maxSeats ||
                        0
                    );


                if (
                    maximum <= 0
                ) {

                    return 0;

                }


                return Math.min(

                    100,

                    (
                        registered /
                        maximum
                    ) * 100

                );

            };


        // =====================================================
        // AVAILABLE SEATS
        // =====================================================

        $scope.getAvailableSeats =
            function (event) {

                if (!event) {

                    return 0;

                }


                if (
                    event.unlimitedSeats
                ) {

                    return null;

                }


                const maximum =
                    Number(
                        event.maxSeats ||
                        0
                    );


                const registered =
                    Number(
                        event.registeredSeats ||
                        0
                    );


                return Math.max(

                    maximum -
                    registered,

                    0

                );

            };


        // =====================================================
        // FULL EVENT
        // =====================================================

        $scope.isEventFull =
            function (event) {

                if (!event) {

                    return false;

                }


                if (
                    event.unlimitedSeats
                ) {

                    return false;

                }


                return (

                    Number(
                        event.registeredSeats ||
                        0
                    )

                    >=

                    Number(
                        event.maxSeats ||
                        0
                    )

                );

            };


        // =====================================================
        // EXTERNAL REGISTRATION
        // =====================================================

        $scope.isExternalRegistration =
            function (event) {

                if (!event) {

                    return false;

                }


                return (

                    String(
                        event.registrationType ||
                        ''
                    ).toLowerCase()

                    ===

                    'external'

                );

            };


        // =====================================================
        // INITIAL LOAD
        // =====================================================

        $scope.loadEvents();

        $scope.loadNotificationCount();

    }
);