app.controller(
    'MyRegistrationsController',
    function (
        $scope,
        $location,
        $window,
        RegistrationService,
        ODService
    ) {

        // =================================================
        // INITIAL DATA
        // =================================================

        $scope.registrations = [];

        $scope.loading = true;

        $scope.errorMessage = '';

        $scope.successMessage = '';

        $scope.cancellingId = null;

        $scope.viewingODId = null;


        // =================================================
        // LOAD MY REGISTRATIONS
        // =================================================

        $scope.loadRegistrations = function () {

            $scope.loading = true;

            $scope.errorMessage = '';

            RegistrationService
                .getMyRegistrations()

                .then(function (response) {

                    if (
                        response.data &&
                        response.data.success
                    ) {

                        $scope.registrations =
                            response.data.registrations || [];


                        // After registrations are loaded,
                        // check which events have an OD.

                        return ODService
                            .getMyOD();

                    }


                    $scope.registrations = [];

                    $scope.errorMessage =
                        (
                            response.data &&
                            response.data.message
                        ) ||
                        'Unable to load your registrations.';

                    return null;

                })

                .then(function (odResponse) {

                    if (
                        !odResponse ||
                        !odResponse.data ||
                        !odResponse.data.success
                    ) {
                        return;
                    }


                    const odDocuments =
                        odResponse.data.odDocuments || [];


                    // -----------------------------------------
                    // Create event ID lookup
                    // -----------------------------------------

                    const odEventIds = {};


                    odDocuments.forEach(
                        function (od) {

                            if (
                                od &&
                                od.eventId
                            ) {

                                odEventIds[
                                    String(od.eventId)
                                ] = true;

                            }

                        }
                    );


                    // -----------------------------------------
                    // Mark OD availability
                    // -----------------------------------------

                    $scope.registrations.forEach(
                        function (registration) {

                            const eventId =
                                registration.eventId;


                            registration.odAvailable =
                                registration.attendance === 'present' &&
                                eventId &&
                                !!odEventIds[
                                    String(eventId)
                                ];

                        }
                    );

                })

                .catch(function (error) {

                    console.error(
                        'My Registrations / OD Error:',
                        error
                    );


                    // If registration loading itself
                    // failed, show the main error.

                    if (
                        !$scope.registrations.length
                    ) {

                        $scope.registrations = [];

                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to load your registrations.';

                    }

                    else {

                        // Registrations loaded successfully
                        // but OD lookup failed.
                        //
                        // Keep registrations visible.
                        // Simply make OD unavailable.

                        $scope.registrations.forEach(
                            function (registration) {

                                registration.odAvailable =
                                    false;

                            }
                        );

                    }

                })

                .finally(function () {

                    $scope.loading = false;

                });

        };


        // =================================================
        // VIEW OD PDF
        // =================================================

        $scope.viewOD = function (
            registration
        ) {

            if (
                !registration ||
                !registration.eventId
            ) {
                return;
            }


            // -----------------------------------------
            // Frontend eligibility check
            // -----------------------------------------

            if (
                registration.attendance !==
                'present'
            ) {

                $scope.errorMessage =
                    'OD is available only for students marked Present.';

                return;

            }


            if (
                !registration.odAvailable
            ) {

                $scope.errorMessage =
                    'The signed OD PDF is not available yet.';

                return;

            }


            $scope.viewingODId =
                registration._id;

            $scope.errorMessage = '';


            // -----------------------------------------
            // Open blank tab immediately.
            // This avoids popup blockers.
            // -----------------------------------------

            const previewWindow =
                $window.open(
                    '',
                    '_blank'
                );


            if (!previewWindow) {

                $scope.viewingODId =
                    null;

                $scope.errorMessage =
                    'Please allow pop-ups to view the OD PDF.';

                return;

            }


            // -----------------------------------------
            // Download protected PDF
            // -----------------------------------------

            ODService
                .downloadOD(
                    registration.eventId
                )

                .then(function (response) {

                    const blob =
                        new Blob(
                            [response.data],
                            {
                                type:
                                    'application/pdf'
                            }
                        );


                    const pdfUrl =
                        URL.createObjectURL(
                            blob
                        );


                    previewWindow.location.href =
                        pdfUrl;


                    // Release the object URL later.

                    $window.setTimeout(
                        function () {

                            URL.revokeObjectURL(
                                pdfUrl
                            );

                        },
                        60000
                    );

                })

                .catch(function (error) {

                    console.error(
                        'View OD Error:',
                        error
                    );


                    previewWindow.close();


                    // Backend performs the actual
                    // authorization check.

                    if (
                        error.status === 403
                    ) {

                        $scope.errorMessage =
                            'You are not allowed to access this OD document.';

                    }

                    else if (
                        error.status === 404
                    ) {

                        $scope.errorMessage =
                            'The signed OD PDF is not available.';

                    }

                    else {

                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to open the OD PDF.';

                    }

                })

                .finally(function () {

                    $scope.viewingODId =
                        null;

                });

        };


        // =================================================
        // FORMAT DATE
        // =================================================

        $scope.formatDate = function (date) {

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


        // =================================================
        // FORMAT TIME
        // =================================================

        $scope.formatTime = function (time) {

            if (!time) {
                return '-';
            }


            // Supports HH:mm format such as 14:30

            if (
                typeof time === 'string' &&
                /^\d{2}:\d{2}$/.test(time)
            ) {

                const parts =
                    time.split(':');


                let hour =
                    parseInt(
                        parts[0],
                        10
                    );


                const minute =
                    parts[1];


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


            const parsedTime =
                new Date(time);


            if (
                isNaN(
                    parsedTime.getTime()
                )
            ) {

                return '-';

            }


            return parsedTime.toLocaleTimeString(
                'en-IN',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );

        };


        // =================================================
        // STATUS CLASS
        // =================================================

        $scope.getStatusClass = function (
            status
        ) {

            status = String(
                status || ''
            ).toLowerCase();


            if (
                status === 'attended'
            ) {

                return 'bg-success-subtle text-success';

            }


            if (
                status === 'cancelled'
            ) {

                return 'bg-danger-subtle text-danger';

            }


            return 'bg-primary-subtle text-primary';

        };


        // =================================================
        // ATTENDANCE CLASS
        // =================================================

        $scope.getAttendanceClass = function (
            attendance
        ) {

            attendance = String(
                attendance || ''
            ).toLowerCase();


            if (
                attendance === 'present'
            ) {

                return 'bg-success-subtle text-success';

            }


            return 'bg-secondary-subtle text-secondary';

        };


        // =================================================
        // DISPLAY STATUS
        // =================================================

        $scope.getStatusText = function (
            status
        ) {

            if (!status) {
                return 'Upcoming';
            }


            status =
                String(status);


            return (
                status.charAt(0).toUpperCase() +
                status.slice(1)
            );

        };


        // =================================================
        // DISPLAY ATTENDANCE
        // =================================================

        $scope.getAttendanceText = function (
            attendance
        ) {

            if (!attendance) {
                return 'Absent';
            }


            attendance =
                String(attendance);


            return (
                attendance.charAt(0).toUpperCase() +
                attendance.slice(1)
            );

        };


        // =================================================
        // CHECK WHETHER REGISTRATION CAN BE CANCELLED
        // =================================================

        $scope.canCancel = function (
            registration
        ) {

            if (!registration) {
                return false;
            }


            return String(
                registration.status || ''
            ).toLowerCase() === 'upcoming';

        };


        // =================================================
        // CANCEL REGISTRATION
        // =================================================

        $scope.cancelRegistration = function (
            registration
        ) {

            if (!registration) {
                return;
            }


            if (
                !$scope.canCancel(
                    registration
                )
            ) {

                return;

            }


            const confirmed =
                $window.confirm(
                    'Are you sure you want to cancel this registration?'
                );


            if (!confirmed) {
                return;
            }


            $scope.cancellingId =
                registration._id;


            $scope.errorMessage =
                '';

            $scope.successMessage =
                '';


            RegistrationService
                .cancelRegistration(
                    registration._id
                )

                .then(function (response) {

                    if (
                        response.data &&
                        response.data.success
                    ) {

                        $scope.successMessage =
                            'Registration cancelled successfully.';


                        // Remove from current list.

                        $scope.registrations =
                            $scope.registrations.filter(
                                function (item) {

                                    return String(
                                        item._id
                                    ) !== String(
                                        registration._id
                                    );

                                }
                            );

                    }

                    else {

                        $scope.errorMessage =
                            (
                                response.data &&
                                response.data.message
                            ) ||
                            'Unable to cancel registration.';

                    }

                })

                .catch(function (error) {

                    console.error(
                        'Cancel Registration Error:',
                        error
                    );


                    $scope.errorMessage =
                        (
                            error.data &&
                            error.data.message
                        ) ||
                        'Unable to cancel registration.';

                })

                .finally(function () {

                    $scope.cancellingId =
                        null;

                });

        };


        // =================================================
        // OPEN EVENT DETAILS
        // =================================================

        $scope.viewEvent = function (
            registration
        ) {

            if (
                !registration ||
                !registration.eventId
            ) {
                return;
            }


            $location.path(
                '/student/event/' +
                registration.eventId
            );

        };


        // =================================================
        // GO TO EVENTS
        // =================================================

        $scope.browseEvents = function () {

            $location.path(
                '/student/department-events'
            );

        };


        // =================================================
        // REFRESH
        // =================================================

        $scope.refresh = function () {

            $scope.successMessage =
                '';

            $scope.errorMessage =
                '';

            $scope.loadRegistrations();

        };


        // =================================================
        // INITIAL LOAD
        // =================================================

        $scope.loadRegistrations();

    }
);