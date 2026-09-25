app.controller(
    'StudentProfileController',

    function (
        $scope,
        AuthService
    ) {

        // =========================================
        // LOAD CURRENT STUDENT
        // =========================================

        $scope.user =
            AuthService.currentUser();


        // =========================================
        // CHECK USER
        // =========================================

        if (!$scope.user) {

            console.warn(
                'Student profile: user not found.'
            );

            $scope.user = {

                name: '',

                email: '',

                department: '',

                phone: '',

                role: 'student'

            };

        }

    }
);