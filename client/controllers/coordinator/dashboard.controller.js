app.controller(
    'CoordinatorDashboardController',

    function (
        $scope,
        AuthService,
        EventService
    ) {

        // ==========================================
        // CURRENT USER
        // ==========================================

        $scope.user =
            AuthService.currentUser();


        // Safety fallback
        if (!$scope.user) {

            $scope.user = {
                name: 'Coordinator',
                department: 'Information Technology',
                role: 'coordinator'
            };

        }


        // ==========================================
        // VARIABLES
        // ==========================================

        $scope.loading = true;

        $scope.error = '';

        $scope.events = [];


        $scope.stats = {

            totalEvents: 0,

            upcomingEvents: 0,

            totalParticipants: 0,

            categories: []

        };


        // ==========================================
        // LOAD DASHBOARD
        // ==========================================

        $scope.loadDashboard =
            function () {

                $scope.loading = true;

                $scope.error = '';


                EventService
                    .getCoordinatorDashboard()

                    .then(function (response) {

                        console.log(
                            'Coordinator Dashboard:',
                            response
                        );


                        if (
                            response &&
                            response.success
                        ) {

                            $scope.stats =
                                response.stats || {

                                    totalEvents: 0,

                                    upcomingEvents: 0,

                                    totalParticipants: 0,

                                    categories: []

                                };


                            $scope.events =
                                response.events || [];

                        }

                        else {

                            $scope.error =
                                (
                                    response &&
                                    response.message
                                ) ||
                                'Unable to load coordinator dashboard.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Coordinator dashboard error:',
                            error
                        );


                        $scope.error =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to load coordinator dashboard.';

                    })

                    .finally(function () {

                        $scope.loading = false;

                    });

            };


        // ==========================================
        // CATEGORY ICON
        // ==========================================

        $scope.getCategoryIcon =
            function (category) {

                const icons = {

                    Technical:
                        'fa-laptop-code',

                    Workshop:
                        'fa-tools',

                    Seminar:
                        'fa-chalkboard-teacher',

                    Sports:
                        'fa-running',

                    Cultural:
                        'fa-theater-masks',

                    Placement:
                        'fa-briefcase',

                    NSS:
                        'fa-hands-helping',

                    NCC:
                        'fa-shield-alt',

                    YRC:
                        'fa-heart'

                };


                return (
                    icons[category] ||
                    'fa-calendar'
                );

            };


        // ==========================================
        // INITIAL LOAD
        // ==========================================

        $scope.loadDashboard();

    }
);