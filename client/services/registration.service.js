app.service(
    'RegistrationService',
    function ($http) {

        const API_URL =
            '/api/registrations';


        // =================================================
        // STUDENT
        // Register for an internal event
        // =================================================

        this.registerForEvent =
            function (data) {

                return $http.post(
                    API_URL,
                    data
                );

            };


        // =================================================
        // STUDENT
        // Confirm external registration
        // =================================================

        this.confirmExternalRegistration =
            function (eventId) {

                return $http.post(
                    API_URL +
                    '/external/' +
                    eventId
                );

            };


        // =================================================
        // STUDENT
        // Get logged-in student's registrations
        // =================================================

        this.getMyRegistrations =
            function () {

                return $http.get(
                    API_URL +
                    '/my'
                );

            };


        // =================================================
        // STUDENT
        // Cancel registration
        // =================================================

        this.cancelRegistration =
            function (registrationId) {

                return $http.delete(
                    API_URL +
                    '/' +
                    registrationId
                );

            };


        // =================================================
        // COORDINATOR
        // Get participants of an event
        // =================================================

        this.getEventParticipants =
            function (eventId) {

                return $http.get(
                    API_URL +
                    '/event/' +
                    eventId
                );

            };


        // =================================================
        // COORDINATOR
        // Update attendance
        // =================================================

        this.updateAttendance =
            function (
                registrationId,
                attendance
            ) {

                return $http.patch(
                    API_URL +
                    '/' +
                    registrationId +
                    '/attendance',
                    {
                        attendance:
                            attendance
                    }
                );

            };

    }
);