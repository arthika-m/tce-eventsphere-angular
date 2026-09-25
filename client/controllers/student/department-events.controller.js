app.controller(

    'DepartmentEventsController',

    function (
        $scope,
        $location,
        EventService,
        AuthService
    ) {


        // ==========================================
        // CURRENT USER
        // ==========================================

        $scope.user =
            AuthService.currentUser();


        // ==========================================
        // VARIABLES
        // ==========================================

        $scope.events = [];

        $scope.loading =
            true;

        $scope.error =
            '';


        // ==========================================
        // LOAD DEPARTMENT EVENTS
        // ==========================================

        $scope.loadEvents =
            function () {

                $scope.loading =
                    true;

                $scope.error =
                    '';


                EventService
                    .getDepartmentEvents()

                    .then(function (response) {

                        console.log(
                            'Department Events:',
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
                                'Unable to load department events.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Department Events Error:',
                            error
                        );


                        $scope.events =
                            [];


                        $scope.error =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to load department events.';

                    })

                    .finally(function () {

                        $scope.loading =
                            false;

                    });

            };


        // ==========================================
        // VIEW EVENT
        // ==========================================

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


        // ==========================================
        // DATE FORMAT
        // ==========================================

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

                        day:
                            '2-digit',

                        month:
                            'short',

                        year:
                            'numeric'

                    }

                );

            };


        // ==========================================
        // TIME FORMAT
        // ==========================================

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


                const parsedTime =
                    new Date(time);


                if (
                    isNaN(
                        parsedTime.getTime()
                    )
                ) {

                    return '';

                }


                return parsedTime.toLocaleTimeString(

                    'en-IN',

                    {

                        hour:
                            '2-digit',

                        minute:
                            '2-digit'

                    }

                );

            };


        // ==========================================
        // CATEGORY ICON
        // ==========================================

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


        // ==========================================
        // INITIAL LOAD
        // ==========================================

        $scope.loadEvents();

    }

);