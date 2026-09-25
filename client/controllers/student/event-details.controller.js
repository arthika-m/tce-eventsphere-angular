app.controller(
    'StudentEventDetailsController',
    function (
        $scope,
        $routeParams,
        $location,
        $window,
        EventService,
        RegistrationService
    ) {

        // ============================================
        // VARIABLES
        // ============================================

        $scope.event = null;

        $scope.loading = true;

        $scope.registering = false;

        $scope.confirmingExternal = false;

        $scope.registrationSuccess = false;

        $scope.registrationError = '';

        $scope.alreadyRegistered = false;

        $scope.registration = null;


        // ============================================
        // STUDENT REGISTRATION DATA
        // ============================================

        $scope.registrationData = {

            eventId:
                $routeParams.id,

            rollNumber:
                '',

            year:
                ''

        };


        // ============================================
        // LOAD EVENT
        // ============================================

        $scope.loadEvent = function () {

            $scope.loading = true;

            $scope.registrationError = '';

            EventService
                .getEventById(
                    $routeParams.id
                )

                .then(function (response) {

                    console.log(
                        'Event Details Response:',
                        response
                    );


                    if (
                        response &&
                        response.success
                    ) {

                        $scope.event =
                            response.event;


                        /*
                        Check whether this
                        student already has
                        a registration.
                        */

                        $scope.checkExistingRegistration();

                    } else {

                        $scope.event = null;

                        $scope.registrationError =
                            (
                                response &&
                                response.message
                            ) ||
                            'Unable to load event.';

                    }

                })

                .catch(function (error) {

                    console.error(
                        'Load Event Error:',
                        error
                    );

                    $scope.event = null;

                    $scope.registrationError =
                        (
                            error.data &&
                            error.data.message
                        ) ||
                        'Unable to load event.';

                })

                .finally(function () {

                    $scope.loading = false;

                });

        };


        // ============================================
        // CHECK EXISTING REGISTRATION
        // ============================================

        $scope.checkExistingRegistration =
            function () {

                RegistrationService
                    .getMyRegistrations()

                    .then(function (response) {

                        if (
                            !response.data ||
                            !response.data.success
                        ) {

                            return;

                        }


                        const registrations =
                            response.data.registrations ||
                            [];


                        const found =
                            registrations.find(
                                function (item) {

                                    /*
                                    eventId can sometimes
                                    be populated as an object.
                                    */

                                    const registeredEventId =
                                        item.eventId &&
                                        item.eventId._id
                                            ? item.eventId._id
                                            : item.eventId;


                                    return String(
                                        registeredEventId
                                    ) ===
                                    String(
                                        $routeParams.id
                                    );

                                }
                            );


                        if (found) {

                            $scope.alreadyRegistered =
                                true;

                            $scope.registration =
                                found;

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Registration Check Error:',
                            error
                        );

                    });

            };


        // ============================================
        // CHECK EXTERNAL REGISTRATION
        // ============================================

        $scope.isExternalRegistration =
            function () {

                if (
                    !$scope.event
                ) {

                    return false;

                }


                return (
                    String(
                        $scope.event.registrationType ||
                        ''
                    ).toLowerCase() ===
                    'external'
                );

            };


        // ============================================
        // OPEN EXTERNAL REGISTRATION WEBSITE
        // ============================================

        $scope.openExternalRegistration =
            function () {

                if (
                    !$scope.event
                ) {

                    return;

                }


                if (
                    !$scope.event.registrationLink
                ) {

                    $scope.registrationError =
                        'External registration link is not available.';

                    return;

                }


                $scope.registrationError = '';


                $window.open(
                    $scope.event.registrationLink,
                    '_blank'
                );

            };


        // ============================================
        // CONFIRM EXTERNAL REGISTRATION
        // ============================================

        $scope.confirmExternalRegistration =
            function () {

                if (
                    !$scope.event
                ) {

                    return;

                }


                /*
                Only external events
                can use this function.
                */

                if (
                    !$scope.isExternalRegistration()
                ) {

                    return;

                }


                /*
                Prevent duplicate clicks.
                */

                if (
                    $scope.confirmingExternal
                ) {

                    return;

                }


                /*
                Already registered.
                */

                if (
                    $scope.alreadyRegistered
                ) {

                    return;

                }


                $scope.confirmingExternal =
                    true;

                $scope.registrationError =
                    '';


                RegistrationService
                    .confirmExternalRegistration(
                        $routeParams.id
                    )

                    .then(function (response) {

                        console.log(
                            'External Registration Response:',
                            response
                        );


                        if (
                            response.data &&
                            response.data.success
                        ) {

                            /*
                            Registration successful.
                            */

                            $scope.registration =
                                response.data.registration;


                            $scope.alreadyRegistered =
                                true;


                            $scope.registrationSuccess =
                                true;


                            /*
                            Update seat count.
                            */

                            if (
                                $scope.event &&
                                !$scope.event.unlimitedSeats
                            ) {

                                $scope.event.registeredSeats =
                                    Number(
                                        $scope.event.registeredSeats ||
                                        0
                                    ) + 1;

                            }

                        } else {

                            $scope.registrationError =
                                (
                                    response.data &&
                                    response.data.message
                                ) ||
                                'Unable to confirm external registration.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'External Registration Error:',
                            error
                        );


                        $scope.registrationError =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to confirm external registration.';

                    })

                    .finally(function () {

                        $scope.confirmingExternal =
                            false;

                    });

            };


        // ============================================
        // NORMAL REGISTER
        // ============================================

        $scope.register =
            function () {

                if (
                    !$scope.event
                ) {

                    return;

                }


                /*
                ------------------------------------------------
                EXTERNAL EVENT
                ------------------------------------------------

                Keep register() for compatibility.

                If an external event calls register(),
                open the external website.
                ------------------------------------------------
                */

                if (
                    $scope.isExternalRegistration()
                ) {

                    $scope.openExternalRegistration();

                    return;

                }


                /*
                ------------------------------------------------
                ALREADY REGISTERED
                ------------------------------------------------
                */

                if (
                    $scope.alreadyRegistered
                ) {

                    return;

                }


                /*
                ------------------------------------------------
                CHECK FULL EVENT
                ------------------------------------------------
                */

                if (
                    $scope.isFull()
                ) {

                    $scope.registrationError =
                        'Registration is full for this event.';

                    return;

                }


                /*
                ------------------------------------------------
                VALIDATE ROLL NUMBER
                ------------------------------------------------
                */

                if (
                    !$scope.registrationData.rollNumber ||
                    String(
                        $scope.registrationData.rollNumber
                    ).trim() === ''
                ) {

                    $scope.registrationError =
                        'Please enter your roll number.';

                    return;

                }


                /*
                ------------------------------------------------
                VALIDATE YEAR
                ------------------------------------------------
                */

                if (
                    !$scope.registrationData.year
                ) {

                    $scope.registrationError =
                        'Please select your year.';

                    return;

                }


                /*
                ------------------------------------------------
                START NORMAL REGISTRATION
                ------------------------------------------------
                */

                $scope.registering = true;

                $scope.registrationError = '';

                $scope.registrationSuccess = false;


                $scope.registrationData.eventId =
                    $routeParams.id;


                RegistrationService
                    .registerForEvent(
                        $scope.registrationData
                    )

                    .then(function (response) {

                        console.log(
                            'Registration Response:',
                            response
                        );


                        if (
                            response.data &&
                            response.data.success
                        ) {

                            /*
                            Registration successful.
                            */

                            $scope.registrationSuccess =
                                true;


                            $scope.alreadyRegistered =
                                true;


                            $scope.registration =
                                response.data.registration;


                            /*
                            Update displayed seat count.
                            */

                            if (
                                $scope.event &&
                                !$scope.event.unlimitedSeats
                            ) {

                                $scope.event.registeredSeats =
                                    Number(
                                        $scope.event.registeredSeats ||
                                        0
                                    ) + 1;

                            }

                        } else {

                            $scope.registrationError =
                                (
                                    response.data &&
                                    response.data.message
                                ) ||
                                'Unable to register.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Registration Error:',
                            error
                        );


                        $scope.registrationError =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to register for this event.';

                    })

                    .finally(function () {

                        $scope.registering =
                            false;

                    });

            };


        // ============================================
        // BACK
        // ============================================

        $scope.goBack =
            function () {

                $window.history.back();

            };


        // ============================================
        // FORMAT DATE
        // ============================================

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


        // ============================================
        // FORMAT TIME
        // ============================================

        $scope.formatTime =
            function (time) {

                if (!time) {

                    return '-';

                }


                /*
                Backend stores time as HH:mm.

                Example:
                14:28
                09:30
                18:45
                */

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
                        parts[1] || '00';


                    if (
                        isNaN(hour)
                    ) {

                        return time;

                    }


                    const period =
                        hour >= 12
                            ? 'PM'
                            : 'AM';


                    hour =
                        hour % 12 || 12;


                    return (
                        hour +
                        ':' +
                        minute +
                        ' ' +
                        period
                    );

                }


                /*
                Fallback if a complete
                Date/time value is returned.
                */

                const parsedTime =
                    new Date(time);


                if (
                    isNaN(
                        parsedTime.getTime()
                    )
                ) {

                    return String(time);

                }


                return parsedTime.toLocaleTimeString(
                    'en-IN',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            };


        // ============================================
        // SEAT STATUS
        // ============================================

        $scope.getSeatText =
            function () {

                if (
                    !$scope.event
                ) {

                    return '';

                }


                if (
                    $scope.event.unlimitedSeats
                ) {

                    return 'Unlimited Seats';

                }


                const max =
                    Number(
                        $scope.event.maxSeats ||
                        0
                    );


                const registered =
                    Number(
                        $scope.event.registeredSeats ||
                        0
                    );


                const available =
                    Math.max(
                        max - registered,
                        0
                    );


                return (
                    available +
                    ' seats available'
                );

            };


        // ============================================
        // CHECK WHETHER EVENT IS FULL
        // ============================================

        $scope.isFull =
            function () {

                if (
                    !$scope.event
                ) {

                    return false;

                }


                if (
                    $scope.event.unlimitedSeats
                ) {

                    return false;

                }


                const max =
                    Number(
                        $scope.event.maxSeats ||
                        0
                    );


                const registered =
                    Number(
                        $scope.event.registeredSeats ||
                        0
                    );


                return (
                    registered >= max
                );

            };


        // ============================================
        // REGISTRATION PERIOD
        // ============================================

        $scope.isRegistrationOpen =
            function () {

                /*
                Backend performs the
                final validation.

                Kept for future UI handling.
                */

                return true;

            };


        // ============================================
        // INITIAL LOAD
        // ============================================

        $scope.loadEvent();

    }
);