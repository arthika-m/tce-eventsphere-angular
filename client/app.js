const app = angular.module(
    'tceEventSphere',
    ['ngRoute']
);


// =====================================================
// HTTP INTERCEPTOR
// =====================================================

app.config([
    '$httpProvider',

    function ($httpProvider) {

        $httpProvider.interceptors.push(

            function ($window, $q) {

                return {

                    // =========================================
                    // ADD JWT TOKEN
                    // =========================================

                    request: function (config) {

                        const token =
                            $window.localStorage.getItem(
                                'tce_token'
                            );

                        if (token) {

                            config.headers =
                                config.headers || {};

                            config.headers.Authorization =
                                'Bearer ' + token;
                        }

                        return config;
                    },


                    // =========================================
                    // HANDLE 401
                    // =========================================

                    responseError: function (rejection) {

                        if (
                            rejection.status === 401
                        ) {

                            const requestUrl =
                                rejection.config &&
                                rejection.config.url
                                    ? rejection.config.url
                                    : '';

                            if (
                                !requestUrl.includes(
                                    '/api/auth/login'
                                ) &&
                                !requestUrl.includes(
                                    '/api/auth/register'
                                )
                            ) {

                                $window.localStorage.removeItem(
                                    'tce_token'
                                );

                                $window.localStorage.removeItem(
                                    'tce_user'
                                );

                                $window.location.hash =
                                    '#!/login';
                            }
                        }

                        return $q.reject(
                            rejection
                        );
                    }
                };
            }
        );
    }
]);


// =====================================================
// ROUTING
// =====================================================

app.config([

    '$routeProvider',

    function ($routeProvider) {

        $routeProvider


            // =================================================
            // PUBLIC LANDING PAGE
            // =================================================
            //
            // IMPORTANT:
            // There is no LandingController file.
            // Therefore this route uses only the HTML view.
            //
            // =================================================

            .when('/', {

                templateUrl:
                    'views/landing/landing.html'
            })


            // =================================================
            // LOGIN
            // =================================================

            .when('/login', {

                templateUrl:
                    'views/auth/login.html',

                controller:
                    'LoginController'
            })


            // =================================================
            // REGISTER
            // =================================================

            .when('/register', {

                templateUrl:
                    'views/auth/register.html',

                controller:
                    'RegisterController'
            })


            // =================================================
            // STUDENT DASHBOARD
            // =================================================

            .when('/student/dashboard', {

                templateUrl:
                    'views/student/dashboard.html',

                controller:
                    'StudentDashboardController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT DEPARTMENT EVENTS
            // =================================================

            .when('/student/department-events', {

                templateUrl:
                    'views/student/department-events.html',

                controller:
                    'DepartmentEventsController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT COLLEGE EVENTS
            // =================================================

            .when('/student/college-events', {

                templateUrl:
                    'views/student/college-events.html',

                controller:
                    'CollegeEventsController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT EVENT DETAILS
            // =================================================

            .when('/student/event/:id', {

                templateUrl:
                    'views/student/event-details.html',

                controller:
                    'StudentEventDetailsController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT MY REGISTRATIONS
            // =================================================

            .when('/student/my-registrations', {

                templateUrl:
                    'views/student/my-registrations.html',

                controller:
                    'MyRegistrationsController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT NOTIFICATIONS
            // =================================================

            .when('/student/notifications', {

                templateUrl:
                    'views/student/notifications.html',

                controller:
                    'StudentNotificationsController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // STUDENT PROFILE
            // =================================================

            .when('/student/profile', {

                templateUrl:
                    'views/student/profile.html',

                controller:
                    'StudentProfileController',

                resolve: {
                    auth:
                        requireRole('student')
                }
            })


            // =================================================
            // COORDINATOR DASHBOARD
            // =================================================

            .when('/coordinator/dashboard', {

                templateUrl:
                    'views/coordinator/dashboard.html',

                controller:
                    'CoordinatorDashboardController',

                resolve: {
                    auth:
                        requireRole('coordinator')
                }
            })


            // =================================================
            // COORDINATOR CREATE EVENT
            // =================================================

            .when('/coordinator/create-event', {

                templateUrl:
                    'views/coordinator/create-event.html',

                controller:
                    'CreateEventController',

                resolve: {
                    auth:
                        requireRole('coordinator')
                }
            })


            // =================================================
            // COORDINATOR MANAGE EVENTS
            // =================================================

            .when('/coordinator/manage-events', {

                templateUrl:
                    'views/coordinator/manage-events.html',

                controller:
                    'ManageEventsController',

                resolve: {
                    auth:
                        requireRole('coordinator')
                }
            })


            // =================================================
            // COORDINATOR PARTICIPANTS
            // =================================================

            .when(
                '/coordinator/participants',
                {

                    templateUrl:
                        'views/coordinator/participants.html',

                    controller:
                        'CoordinatorParticipantsController',

                    resolve: {
                        auth:
                            requireRole('coordinator')
                    }
                }
            )


            // =================================================
            // COORDINATOR PARTICIPANTS - SPECIFIC EVENT
            // =================================================

            .when(
                '/coordinator/participants/:eventId',
                {

                    templateUrl:
                        'views/coordinator/participants.html',

                    controller:
                        'CoordinatorParticipantsController',

                    resolve: {
                        auth:
                            requireRole('coordinator')
                    }
                }
            )


            // =================================================
            // COORDINATOR PROFILE
            // =================================================

            .when('/coordinator/profile', {

                templateUrl:
                    'views/coordinator/profile.html',

                controller:
                    'CoordinatorProfileController',

                resolve: {
                    auth:
                        requireRole('coordinator')
                }
            })


            // =================================================
            // DEFAULT
            // =================================================

            .otherwise({

                redirectTo:
                    '/'
            });

    }
]);


// =====================================================
// ROLE GUARD
// =====================================================

function requireRole(role) {

    return [

        '$q',
        '$location',
        'AuthService',

        function (
            $q,
            $location,
            AuthService
        ) {

            const deferred =
                $q.defer();


            // =============================================
            // LOGIN CHECK
            // =============================================

            if (
                !AuthService.isAuthenticated()
            ) {

                $location.path(
                    '/login'
                );

                deferred.reject();

                return deferred.promise;
            }


            // =============================================
            // CURRENT USER
            // =============================================

            const user =
                AuthService.currentUser();


            if (!user) {

                AuthService.logout();

                $location.path(
                    '/login'
                );

                deferred.reject();

                return deferred.promise;
            }


            // =============================================
            // ROLE CHECK
            // =============================================

            if (
                user.role !== role
            ) {

                if (
                    user.role === 'student'
                ) {

                    $location.path(
                        '/student/dashboard'
                    );

                }

                else if (
                    user.role === 'coordinator'
                ) {

                    $location.path(
                        '/coordinator/dashboard'
                    );

                }

                else {

                    AuthService.logout();

                    $location.path(
                        '/login'
                    );
                }


                deferred.reject();

                return deferred.promise;
            }


            deferred.resolve(
                user
            );

            return deferred.promise;
        }
    ];
}


// =====================================================
// ROOT SCOPE
// =====================================================

app.run([

    '$rootScope',
    '$location',
    'AuthService',

    function (
        $rootScope,
        $location,
        AuthService
    ) {

        $rootScope.loading =
            false;

        $rootScope.currentUser =
            AuthService.currentUser();


        // =============================================
        // ROUTE START
        // =============================================

        $rootScope.$on(
            '$routeChangeStart',

            function () {

                $rootScope.loading =
                    true;

                $rootScope.currentUser =
                    AuthService.currentUser();
            }
        );


        // =============================================
        // ROUTE SUCCESS
        // =============================================

        $rootScope.$on(
            '$routeChangeSuccess',

            function () {

                $rootScope.loading =
                    false;

                $rootScope.currentUser =
                    AuthService.currentUser();


                if (
                    typeof AOS !==
                    'undefined'
                ) {

                    setTimeout(
                        function () {

                            AOS.refresh();

                        },
                        100
                    );
                }
            }
        );


        // =============================================
        // ROUTE ERROR
        // =============================================

        $rootScope.$on(
            '$routeChangeError',

            function () {

                $rootScope.loading =
                    false;
            }
        );


        // =============================================
        // LOGOUT
        // =============================================

        $rootScope.logout =
            function () {

                AuthService.logout();

                $rootScope.currentUser =
                    null;

                $location.path(
                    '/login'
                );
            };


        // =============================================
        // CURRENT USER
        // =============================================

        $rootScope.getCurrentUser =
            function () {

                return AuthService.currentUser();
            };


        // =============================================
        // AUTHENTICATED
        // =============================================

        $rootScope.isAuthenticated =
            function () {

                return AuthService.isAuthenticated();
            };


        // =============================================
        // STUDENT
        // =============================================

        $rootScope.isStudent =
            function () {

                const user =
                    AuthService.currentUser();

                return (
                    user &&
                    user.role === 'student'
                );
            };


        // =============================================
        // COORDINATOR
        // =============================================

        $rootScope.isCoordinator =
            function () {

                const user =
                    AuthService.currentUser();

                return (
                    user &&
                    user.role === 'coordinator'
                );
            };

    }

]);