app.factory('ApiService', [
    '$http',
    'APP_CONFIG',
    function ($http, APP_CONFIG) {

        var baseUrl = APP_CONFIG.apiBaseUrl;

        return {

            get: function (url, config) {
                return $http.get(
                    baseUrl + url,
                    config
                );
            },

            post: function (url, data, config) {
                return $http.post(
                    baseUrl + url,
                    data,
                    config
                );
            },

            put: function (url, data, config) {
                return $http.put(
                    baseUrl + url,
                    data,
                    config
                );
            },

            delete: function (url, config) {
                return $http.delete(
                    baseUrl + url,
                    config
                );
            }

        };
    }
]);