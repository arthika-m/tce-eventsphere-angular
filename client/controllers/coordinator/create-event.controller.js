app.controller(
    'CreateEventController',
    function (
        $scope,
        $location,
        AuthService,
        EventService
    ) {

        // =================================================
        // CURRENT USER
        // =================================================

        $scope.user = AuthService.currentUser();


        // =================================================
        // CATEGORIES
        // =================================================

        $scope.categories = [

            'Technical',
            'Workshop',
            'Seminar',
            'Sports',
            'Cultural',
            'Placement',
            'NSS',
            'NCC',
            'YRC'

        ];


        // =================================================
        // DEFAULT EVENT
        // =================================================

        function getDefaultEvent() {

            return {

                title: '',

                description: '',

                clubName: '',

                category: '',

                venue: '',

                eventDate: '',

                eventTime: '',

                regStartDate: '',

                regStartTime: '',

                regEndDate: '',

                regEndTime: '',

                maxSeats: '',

                unlimitedSeats: false,

                registrationType: 'built-in',

                registrationLink: '',

                posterURL: '',

                posterType: 'image',

                visibility: 'DepartmentOnly'

            };

        }


        $scope.event = getDefaultEvent();


        // =================================================
        // STATUS
        // =================================================

        $scope.submitting = false;

        $scope.success = '';

        $scope.error = '';


        // =================================================
        // REGISTRATION TYPE
        // =================================================

        $scope.setRegistrationType = function (type) {

            $scope.event.registrationType = type;

            if (type === 'built-in') {

                $scope.event.registrationLink = '';

            }

        };


        // =================================================
        // UNLIMITED SEATS
        // =================================================

        $scope.toggleUnlimitedSeats = function () {

            $scope.event.unlimitedSeats =
                !$scope.event.unlimitedSeats;

            if ($scope.event.unlimitedSeats) {

                $scope.event.maxSeats = '';

            }

        };


        // =================================================
        // POSTER TYPE
        // =================================================

        $scope.setPosterType = function (type) {

            $scope.event.posterType = type;

        };


        // =================================================
        // RESET FORM
        // =================================================

        $scope.resetForm = function () {

            $scope.event = getDefaultEvent();

            $scope.error = '';

            $scope.success = '';

        };


        // =================================================
        // SUBMIT EVENT
        // =================================================

        $scope.submitEvent = function (form) {

            $scope.error = '';

            $scope.success = '';


            // -----------------------------
            // BASIC FORM VALIDATION
            // -----------------------------

            if (!form || form.$invalid) {

                $scope.error =
                    'Please fill all required fields.';

                return;

            }


            // -----------------------------
            // SEAT VALIDATION
            // -----------------------------

            if (
                !$scope.event.unlimitedSeats &&
                (
                    !$scope.event.maxSeats ||
                    Number($scope.event.maxSeats) < 1
                )
            ) {

                $scope.error =
                    'Please enter a valid maximum seat count.';

                return;

            }


            // -----------------------------
            // EXTERNAL REGISTRATION
            // -----------------------------

            if (
                $scope.event.registrationType === 'external' &&
                !$scope.event.registrationLink
            ) {

                $scope.error =
                    'Please enter the external registration link.';

                return;

            }


            // -----------------------------
            // SUBMITTING
            // -----------------------------

            $scope.submitting = true;


            // -----------------------------
            // SEND TO BACKEND
            // -----------------------------

            EventService
                .createEvent($scope.event)

                .then(function (response) {

                    console.log(
                        'Create Event Response:',
                        response
                    );


                    if (response && response.success) {

                        $scope.success =
                            'Event published successfully!';

                        $scope.event =
                            getDefaultEvent();


                        // Reset Angular form state
                        if (form) {

                            form.$setPristine();

                            form.$setUntouched();

                        }

                    } else {

                        $scope.error =
                            response && response.message
                                ? response.message
                                : 'Unable to create event.';

                    }

                })

                .catch(function (error) {

                    console.error(
                        'Create event error:',
                        error
                    );


                    if (
                        error &&
                        error.data &&
                        error.data.message
                    ) {

                        $scope.error =
                            error.data.message;

                    } else {

                        $scope.error =
                            'Unable to create event.';

                    }

                })

                .finally(function () {

                    $scope.submitting = false;

                });

        };


        // =================================================
        // BACK TO DASHBOARD
        // =================================================

        $scope.goBack = function () {

            $location.path(
                '/coordinator/dashboard'
            );

        };

    }
);