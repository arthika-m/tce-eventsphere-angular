app.service(
    'ODService',
    function ($http) {

        const API = '/api/od';


        // Get OD information for an event
        this.getEventOD = function (eventId) {

            return $http.get(
                API + '/' + eventId
            );

        };


        // Upload signed OD PDF
        this.uploadOD = function (
            eventId,
            file
        ) {

            const formData = new FormData();

            formData.append(
                'odPdf',
                file
            );

            return $http.post(
                API +
                '/' +
                eventId +
                '/upload',

                formData,

                {
                    transformRequest:
                        angular.identity,

                    headers: {
                        'Content-Type': undefined
                    }
                }
            );

        };


        // Download/view OD PDF
        this.downloadOD = function (
            eventId
        ) {

            return $http.get(
                API +
                '/' +
                eventId +
                '/download',

                {
                    responseType: 'blob'
                }
            );

        };


        // Get OD documents available
        // for the logged-in student
        this.getMyOD = function () {

            return $http.get(
                API + '/my'
            );

        };

    }
);