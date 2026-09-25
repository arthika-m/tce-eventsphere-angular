app.service(
    'AuthService',
    function (
        $http,
        $window
    ) {

        const API =
            '/api/auth';


        // =====================================================
        // LOGIN
        // =====================================================

        this.login = function (loginData) {

            return $http
                .post(
                    API + '/login',
                    {
                        email:
                            loginData.email,

                        password:
                            loginData.password
                    }
                )

                .then(
                    function (response) {

                        const data =
                            response.data;


                        // Save JWT token
                        if (
                            data.token
                        ) {

                            $window.localStorage.setItem(
                                'tce_token',
                                data.token
                            );

                        }


                        // Save complete user
                        if (
                            data.user
                        ) {

                            $window.localStorage.setItem(
                                'tce_user',
                                JSON.stringify(
                                    data.user
                                )
                            );

                        }


                        return data;

                    }
                );

        };


        // =====================================================
        // STUDENT REGISTRATION
        // =====================================================

        this.registerStudent =
            function (studentData) {

                return $http
                    .post(
                        API + '/register',
                        studentData
                    )

                    .then(
                        function (response) {

                            return response.data;

                        }
                    );

            };


        // =====================================================
        // CURRENT USER
        // =====================================================

        this.currentUser =
            function () {

                const user =
                    $window.localStorage.getItem(
                        'tce_user'
                    );


                if (!user) {

                    return null;

                }


                try {

                    return JSON.parse(
                        user
                    );

                } catch (error) {

                    console.error(
                        'Invalid stored user:',
                        error
                    );


                    $window.localStorage.removeItem(
                        'tce_user'
                    );


                    return null;

                }

            };


        // =====================================================
        // GET TOKEN
        // =====================================================

        this.getToken =
            function () {

                return $window.localStorage.getItem(
                    'tce_token'
                );

            };


        // =====================================================
        // CHECK AUTHENTICATION
        // =====================================================

        this.isAuthenticated =
            function () {

                const token =
                    $window.localStorage.getItem(
                        'tce_token'
                    );

                const user =
                    $window.localStorage.getItem(
                        'tce_user'
                    );


                return !!(
                    token &&
                    user
                );

            };


        // =====================================================
        // LOGOUT
        // =====================================================

        this.logout =
            function () {

                $window.localStorage.removeItem(
                    'tce_token'
                );

                $window.localStorage.removeItem(
                    'tce_user'
                );

            };


        // =====================================================
        // GET CURRENT USER FROM SERVER
        // =====================================================

        this.getMe =
            function () {

                return $http
                    .get(
                        API + '/me'
                    )

                    .then(
                        function (response) {

                            const data =
                                response.data;


                            if (
                                data.user
                            ) {

                                $window.localStorage.setItem(
                                    'tce_user',
                                    JSON.stringify(
                                        data.user
                                    )
                                );

                            }


                            return data;

                        }
                    );

            };

    }
);