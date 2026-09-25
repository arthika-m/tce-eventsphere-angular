app.controller(
    'LoginController',
    function (
        $scope,
        $location,
        AuthService
    ) {


        // =====================================================
        // LOGIN DATA
        // =====================================================

        $scope.loginData = {

            email: '',

            password: ''

        };


        $scope.loading =
            false;

        $scope.error =
            '';

        $scope.success =
            '';


        // =====================================================
        // LOGIN
        // =====================================================

        $scope.login =
            function () {


                $scope.error =
                    '';

                $scope.success =
                    '';


                // ---------------------------------------------
                // VALIDATION
                // ---------------------------------------------

                if (
                    !$scope.loginData.email ||
                    !$scope.loginData.password
                ) {

                    $scope.error =
                        'Please enter email and password.';

                    return;

                }


                $scope.loading =
                    true;


                // ---------------------------------------------
                // CALL AUTH SERVICE
                // ---------------------------------------------

                AuthService
                    .login(
                        $scope.loginData
                    )

                    .then(
                        function (response) {

                            console.log(
                                'Login Response:',
                                response
                            );


                            if (
                                response &&
                                response.success
                            ) {

                                $scope.success =
                                    'Login successful. Redirecting...';


                                // ---------------------------------
                                // STUDENT
                                // ---------------------------------

                                if (
                                    response.user.role ===
                                    'student'
                                ) {

                                    $location.path(
                                        '/student/dashboard'
                                    );

                                }


                                // ---------------------------------
                                // COORDINATOR
                                // ---------------------------------

                                else if (
                                    response.user.role ===
                                    'coordinator'
                                ) {

                                    $location.path(
                                        '/coordinator/dashboard'
                                    );

                                }


                            } else {

                                $scope.error =
                                    (
                                        response &&
                                        response.message
                                    ) ||
                                    'Login failed.';

                            }

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Login Error:',
                                error
                            );


                            $scope.error =

                                error.data &&
                                error.data.message

                                    ? error.data.message

                                    : 'Unable to login. Please try again.';

                        }
                    )

                    .finally(
                        function () {

                            $scope.loading =
                                false;

                        }
                    );

            };


        // =====================================================
        // DEMO STUDENT
        // =====================================================

        $scope.useStudentDemo =
            function () {

                $scope.loginData.email =
                    'student.demo@tce.edu';

                $scope.loginData.password =
                    'Student@123';

                $scope.error =
                    '';

            };


        // =====================================================
        // DEMO COORDINATOR
        // =====================================================

        $scope.useCoordinatorDemo =
            function () {

                $scope.loginData.email =
                    'it.coordinator@tce.edu';

                $scope.loginData.password =
                    'Coordinator@123';

                $scope.error =
                    '';

            };

    }
);