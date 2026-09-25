app.controller(
    'RegisterController',
    function (
        $scope,
        $location,
        AuthService
    ) {


        // =====================================================
        // REGISTRATION DATA
        // =====================================================

        $scope.registerData = {

            name: '',

            email: '',

            department: '',

            phone: '',

            password: '',

            confirmPassword: ''

        };


        // =====================================================
        // DEPARTMENTS
        // =====================================================

        $scope.departments = [

            'Computer Science & Engineering',

            'Information Technology',

            'Electronics & Communication Engineering',

            'Electrical & Electronics Engineering',

            'Mechanical Engineering',

            'Civil Engineering',

            'Chemical Engineering',

            'Mechatronics Engineering',

            'Aeronautical Engineering'

        ];


        $scope.loading =
            false;

        $scope.error =
            '';

        $scope.success =
            '';


        // =====================================================
        // REGISTER STUDENT
        // =====================================================

        $scope.register =
            function () {


                $scope.error =
                    '';

                $scope.success =
                    '';


                const data =
                    $scope.registerData;


                // ---------------------------------------------
                // REQUIRED FIELDS
                // ---------------------------------------------

                if (
                    !data.name ||
                    !data.email ||
                    !data.department ||
                    !data.phone ||
                    !data.password ||
                    !data.confirmPassword
                ) {

                    $scope.error =
                        'Please fill all required fields.';

                    return;

                }


                // ---------------------------------------------
                // PASSWORD MATCH
                // ---------------------------------------------

                if (
                    data.password !==
                    data.confirmPassword
                ) {

                    $scope.error =
                        'Passwords do not match.';

                    return;

                }


                // ---------------------------------------------
                // PHONE
                // ---------------------------------------------

                if (
                    !/^[0-9]{10}$/.test(
                        data.phone
                    )
                ) {

                    $scope.error =
                        'Phone number must contain exactly 10 digits.';

                    return;

                }


                // ---------------------------------------------
                // PASSWORD LENGTH
                // ---------------------------------------------

                if (
                    data.password.length < 6
                ) {

                    $scope.error =
                        'Password must contain at least 6 characters.';

                    return;

                }


                $scope.loading =
                    true;


                // ---------------------------------------------
                // SEND TO BACKEND
                // ---------------------------------------------

                AuthService
                    .registerStudent(
                        data
                    )

                    .then(
                        function (response) {

                            console.log(
                                'Registration Response:',
                                response
                            );


                            if (
                                response &&
                                response.success
                            ) {

                                $scope.success =
                                    'Registration successful. Please login.';


                                // Go to login
                                $location.path(
                                    '/login'
                                );

                            } else {

                                $scope.error =
                                    (
                                        response &&
                                        response.message
                                    ) ||
                                    'Registration failed.';

                            }

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                'Registration Error:',
                                error
                            );


                            $scope.error =

                                error.data &&
                                error.data.message

                                    ? error.data.message

                                    : 'Unable to register. Please try again.';

                        }
                    )

                    .finally(
                        function () {

                            $scope.loading =
                                false;

                        }
                    );

            };

    }
);