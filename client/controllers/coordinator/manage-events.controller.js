app.controller(
    'ManageEventsController',

    function (
        $scope,
        $location,
        $http
    ) {

        // ============================================================
        // INITIAL DATA
        // ============================================================

        $scope.events = [];

        $scope.filteredEvents = [];

        $scope.searchText = '';

        $scope.loading = false;

        $scope.errorMessage = '';

        $scope.successMessage = '';

        $scope.showEditModal = false;

        $scope.showDeleteModal = false;

        $scope.selectedEvent = null;

        $scope.eventToDelete = null;

        $scope.editLoading = false;

        $scope.deleteLoading = false;


        // ============================================================
        // LOAD EVENTS
        // ============================================================

        $scope.loadEvents = function () {

            $scope.loading = true;

            $scope.errorMessage = '';


            $http
                .get('/api/events')

                .then(function (response) {

                    if (
                        response.data &&
                        response.data.success
                    ) {

                        $scope.events =
                            response.data.events || [];

                        $scope.applyFilters();

                    } else {

                        $scope.errorMessage =
                            (
                                response.data &&
                                response.data.message
                            )
                                ? response.data.message
                                : 'Unable to load events.';
                    }

                })

                .catch(function (error) {

                    console.error(
                        'Load Events Error:',
                        error
                    );


                    $scope.errorMessage =
                        (
                            error.data &&
                            error.data.message
                        )
                            ? error.data.message
                            : 'Unable to load events.';

                })

                .finally(function () {

                    $scope.loading = false;

                });

        };


        // ============================================================
        // SEARCH / FILTER
        // ============================================================

        $scope.applyFilters = function () {

            const search =
                (
                    $scope.searchText ||
                    ''
                )
                    .toLowerCase()
                    .trim();


            if (!search) {

                $scope.filteredEvents =
                    $scope.events;

                return;
            }


            $scope.filteredEvents =
                $scope.events.filter(
                    function (event) {

                        const title =
                            (
                                event.title ||
                                ''
                            ).toLowerCase();


                        const category =
                            (
                                event.category ||
                                ''
                            ).toLowerCase();


                        const club =
                            (
                                event.clubName ||
                                ''
                            ).toLowerCase();


                        const venue =
                            (
                                event.venue ||
                                ''
                            ).toLowerCase();


                        const department =
                            (
                                event.department ||
                                ''
                            ).toLowerCase();


                        return (
                            title.includes(search) ||
                            category.includes(search) ||
                            club.includes(search) ||
                            venue.includes(search) ||
                            department.includes(search)
                        );

                    }
                );

        };


        // ============================================================
        // SEARCH CHANGE
        // ============================================================

        $scope.onSearch = function () {

            $scope.applyFilters();

        };


        // ============================================================
        // FORMAT DATE
        // ============================================================

        $scope.formatDate =
            function (dateValue) {

                if (!dateValue) {
                    return '-';
                }


                const date =
                    new Date(dateValue);


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return dateValue;
                }


                return date.toLocaleDateString(
                    'en-IN',
                    {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }
                );

            };


        // ============================================================
        // FORMAT TIME
        // ============================================================

        $scope.formatTime =
            function (timeValue) {

                if (!timeValue) {
                    return '-';
                }


                // HH:mm

                if (
                    typeof timeValue === 'string' &&
                    /^\d{2}:\d{2}$/.test(timeValue)
                ) {

                    const parts =
                        timeValue.split(':');


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


                // ISO / Date

                const date =
                    new Date(timeValue);


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return timeValue;
                }


                return date.toLocaleTimeString(
                    'en-IN',
                    {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }
                );

            };


        // ============================================================
        // CATEGORY ICON
        // ============================================================

        $scope.getCategoryIcon =
            function (category) {

                const icons = {

                    'Technical':
                        'fa-laptop-code',

                    'Workshop':
                        'fa-tools',

                    'Seminar':
                        'fa-chalkboard-teacher',

                    'Sports':
                        'fa-running',

                    'Cultural':
                        'fa-theater-masks',

                    'Placement':
                        'fa-briefcase',

                    'NSS':
                        'fa-hands-helping',

                    'NCC':
                        'fa-shield-alt',

                    'YRC':
                        'fa-heart'
                };


                return (
                    icons[category] ||
                    'fa-calendar-days'
                );

            };


        // ============================================================
        // CATEGORY CLASS
        // ============================================================

        $scope.getCategoryClass =
            function (category) {

                const classes = {

                    'Technical':
                        'category-technical',

                    'Workshop':
                        'category-workshop',

                    'Seminar':
                        'category-seminar',

                    'Sports':
                        'category-sports',

                    'Cultural':
                        'category-cultural',

                    'Placement':
                        'category-placement',

                    'NSS':
                        'category-nss',

                    'NCC':
                        'category-ncc',

                    'YRC':
                        'category-yrc'
                };


                return (
                    classes[category] ||
                    'category-default'
                );

            };


        // ============================================================
        // VISIBILITY LABEL
        // ============================================================

        $scope.getVisibilityLabel =
            function (visibility) {

                if (
                    visibility ===
                    'CollegeWide'
                ) {

                    return 'College Wide';
                }


                if (
                    visibility ===
                    'OpenToAll'
                ) {

                    return 'Open to All';
                }


                return 'Department Only';

            };


        // ============================================================
        // REGISTRATION TYPE LABEL
        // ============================================================

        $scope.getRegistrationType =
            function (type) {

                if (
                    String(type)
                        .toLowerCase() ===
                    'external'
                ) {

                    return 'External';
                }


                return 'Built-in';

            };


        // ============================================================
        // OPEN EDIT MODAL
        // ============================================================

        $scope.openEditModal =
            function (event) {

                if (!event) {
                    return;
                }


                $scope.selectedEvent =
                    angular.copy(event);


                $scope.showEditModal =
                    true;


                $scope.errorMessage =
                    '';

                $scope.successMessage =
                    '';

            };


        // ============================================================
        // CLOSE EDIT MODAL
        // ============================================================

        $scope.closeEditModal =
            function () {

                if ($scope.editLoading) {
                    return;
                }


                $scope.showEditModal =
                    false;


                $scope.selectedEvent =
                    null;

            };


        // ============================================================
        // UPDATE EVENT
        // ============================================================

        $scope.updateEvent =
            function () {

                if (
                    !$scope.selectedEvent
                ) {
                    return;
                }


                $scope.editLoading =
                    true;


                $scope.errorMessage =
                    '';

                $scope.successMessage =
                    '';


                const event =
                    angular.copy(
                        $scope.selectedEvent
                    );


                if (!event._id) {

                    $scope.errorMessage =
                        'Event ID is missing.';

                    $scope.editLoading =
                        false;

                    return;
                }


                $http
                    .put(
                        '/api/events/' +
                        event._id,
                        event
                    )

                    .then(function (response) {

                        if (
                            response.data &&
                            response.data.success
                        ) {

                            $scope.successMessage =
                                'Event updated successfully.';


                            $scope.showEditModal =
                                false;


                            $scope.selectedEvent =
                                null;


                            $scope.loadEvents();

                        } else {

                            $scope.errorMessage =
                                (
                                    response.data &&
                                    response.data.message
                                )
                                    ? response.data.message
                                    : 'Unable to update event.';
                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Update Event Error:',
                            error
                        );


                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            )
                                ? error.data.message
                                : 'Unable to update event.';

                    })

                    .finally(function () {

                        $scope.editLoading =
                            false;

                    });

            };


        // ============================================================
        // OPEN DELETE MODAL
        // ============================================================

        $scope.openDeleteModal =
            function (event) {

                if (!event) {
                    return;
                }


                $scope.eventToDelete =
                    event;


                $scope.showDeleteModal =
                    true;


                $scope.errorMessage =
                    '';

            };


        // ============================================================
        // CLOSE DELETE MODAL
        // ============================================================

        $scope.closeDeleteModal =
            function () {

                if ($scope.deleteLoading) {
                    return;
                }


                $scope.showDeleteModal =
                    false;


                $scope.eventToDelete =
                    null;

            };


        // ============================================================
        // DELETE EVENT
        // ============================================================

        $scope.deleteEvent =
            function () {

                if (
                    !$scope.eventToDelete
                ) {
                    return;
                }


                $scope.deleteLoading =
                    true;


                $scope.errorMessage =
                    '';


                const eventId =
                    $scope.eventToDelete._id;


                if (!eventId) {

                    $scope.errorMessage =
                        'Event ID is missing.';

                    $scope.deleteLoading =
                        false;

                    return;
                }


                $http
                    .delete(
                        '/api/events/' +
                        eventId
                    )

                    .then(function (response) {

                        if (
                            response.data &&
                            response.data.success
                        ) {

                            $scope.successMessage =
                                'Event deleted successfully.';


                            $scope.showDeleteModal =
                                false;


                            $scope.eventToDelete =
                                null;


                            $scope.loadEvents();

                        } else {

                            $scope.errorMessage =
                                (
                                    response.data &&
                                    response.data.message
                                )
                                    ? response.data.message
                                    : 'Unable to delete event.';
                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Delete Event Error:',
                            error
                        );


                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            )
                                ? error.data.message
                                : 'Unable to delete event.';

                    })

                    .finally(function () {

                        $scope.deleteLoading =
                            false;

                    });

            };


        // ============================================================
        // VIEW EVENT
        // ============================================================

        $scope.viewEvent =
            function (event) {

                if (
                    !event ||
                    !event._id
                ) {
                    return;
                }


                $location.path(
                    '/student/event/' +
                    event._id
                );

            };


        // ============================================================
        // VIEW PARTICIPANTS
        // ============================================================
        //
        // This opens the participants page for
        // the selected event.
        //
        // ============================================================

        $scope.viewParticipants =
            function (event) {

                if (
                    !event ||
                    !event._id
                ) {
                    return;
                }


                $location.path(
                    '/coordinator/participants/' +
                    event._id
                );

            };


        // ============================================================
        // CREATE EVENT
        // ============================================================

        $scope.createEvent =
            function () {

                $location.path(
                    '/coordinator/create-event'
                );

            };


        // ============================================================
        // CLEAR SUCCESS
        // ============================================================

        $scope.clearSuccess =
            function () {

                $scope.successMessage =
                    '';

            };


        // ============================================================
        // INITIAL LOAD
        // ============================================================

        $scope.loadEvents();

    }
);