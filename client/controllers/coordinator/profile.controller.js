app.controller(
    'CoordinatorProfileController',

    function (
        $scope,
        AuthService
    ) {

        // =========================================
        // LOAD CURRENT COORDINATOR
        // =========================================

        $scope.user =
            AuthService.currentUser();


        // =========================================
        // CHECK USER
        // =========================================

        if (!$scope.user) {

            console.warn(
                'Coordinator profile: user not found.'
            );

            $scope.user = {
                name: '',
                email: '',
                department: '',
                phone: '',
                role: 'coordinator'
            };

        }

    }
);