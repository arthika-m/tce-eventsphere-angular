app.service(
    'EventService',
    function ($http) {

        const API =
            '/api/events';


        // =====================================================
        // STUDENT DASHBOARD
        // =====================================================

        this.getStudentDashboardEvents =
            function () {

                return $http
                    .get(
                        API +
                        '/student/dashboard'
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // STUDENT DEPARTMENT EVENTS
        // =====================================================

        this.getDepartmentEvents =
            function () {

                return $http
                    .get(
                        API +
                        '/student/department'
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // STUDENT COLLEGE-WIDE EVENTS
        // =====================================================

        this.getCollegeEvents =
            function () {

                return $http
                    .get(
                        API +
                        '/student/college'
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // GET SINGLE EVENT
        // =====================================================

        this.getEventById =
            function (id) {

                return $http
                    .get(
                        API +
                        '/' +
                        id
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // COORDINATOR - DASHBOARD
        // =====================================================

        this.getCoordinatorDashboard =
            function () {

                return $http
                    .get(
                        API +
                        '/coordinator/dashboard'
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // COORDINATOR - GET ALL EVENTS
        // =====================================================

        this.getEvents =
            function () {

                return $http
                    .get(
                        API
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // COORDINATOR - CREATE EVENT
        // =====================================================

        this.createEvent =
            function (eventData) {

                return $http
                    .post(
                        API,
                        eventData
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // COORDINATOR - UPDATE EVENT
        // =====================================================

        this.updateEvent =
            function (
                id,
                eventData
            ) {

                return $http
                    .put(
                        API +
                        '/' +
                        id,

                        eventData
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // COORDINATOR - DELETE EVENT
        // =====================================================

        this.deleteEvent =
            function (id) {

                return $http
                    .delete(
                        API +
                        '/' +
                        id
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };

    }
);