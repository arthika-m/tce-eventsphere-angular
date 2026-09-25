app.controller(
    'CoordinatorParticipantsController',

    function (
        $scope,
        $routeParams,
        $location,
        $window,
        $http,
        RegistrationService,
        EventService,
        AuthService,
        ODService
    ) {

        // =================================================
        // USER
        // =================================================

        $scope.user =
            AuthService.currentUser();


        // =================================================
        // VARIABLES
        // =================================================

        $scope.events = [];

        $scope.selectedEventId =
            $routeParams.eventId || '';

        $scope.event = null;

        $scope.participants = [];

        $scope.filteredParticipants = [];

        $scope.searchText = '';

        $scope.loadingEvents = true;

        $scope.loading = false;

        $scope.loadingParticipants = false;

        $scope.errorMessage = '';

        $scope.successMessage = '';

        $scope.updatingAttendanceId = null;

        $scope.savingAttendance = false;


        // =================================================
        // OD VARIABLES
        // =================================================

        $scope.odDocument = null;

        $scope.loadingOD = false;

        $scope.uploadingOD = false;

        $scope.selectedODFile = null;


        // =================================================
        // LOAD ALL EVENTS
        // =================================================

        $scope.loadEvents = function () {

            $scope.loadingEvents = true;

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


                        // ---------------------------------
                        // Event ID exists in URL
                        // ---------------------------------

                        if (
                            $scope.selectedEventId
                        ) {

                            const foundEvent =
                                $scope.events.find(
                                    function (event) {

                                        return (
                                            event._id ===
                                            $scope.selectedEventId
                                        );

                                    }
                                );


                            if (foundEvent) {

                                $scope.selectEvent(
                                    foundEvent,
                                    false
                                );

                            } else {

                                $scope.errorMessage =
                                    'Selected event was not found.';

                            }

                        }

                        // ---------------------------------
                        // No event ID
                        // ---------------------------------

                        else if (
                            $scope.events.length > 0
                        ) {

                            $scope.selectedEventId =
                                $scope.events[0]._id;

                            $scope.selectEvent(
                                $scope.events[0],
                                false
                            );

                        }

                    } else {

                        $scope.errorMessage =
                            (
                                response.data &&
                                response.data.message
                            ) ||
                            'Unable to load events.';

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
                        ) ||
                        'Unable to load events.';

                })

                .finally(function () {

                    $scope.loadingEvents =
                        false;

                });

        };


        // =================================================
        // SELECT EVENT
        // =================================================

        $scope.selectEvent =
            function (
                selectedEvent,
                changeUrl
            ) {

                if (
                    !selectedEvent ||
                    !selectedEvent._id
                ) {
                    return;
                }


                $scope.selectedEventId =
                    selectedEvent._id;


                $scope.event =
                    selectedEvent;


                $scope.participants =
                    [];

                $scope.filteredParticipants =
                    [];

                $scope.searchText =
                    '';

                $scope.successMessage =
                    '';

                $scope.errorMessage =
                    '';


                // -----------------------------------------
                // Reset OD
                // -----------------------------------------

                $scope.odDocument =
                    null;

                $scope.selectedODFile =
                    null;


                // -----------------------------------------
                // Update URL
                // -----------------------------------------

                if (changeUrl !== false) {

                    $location.path(
                        '/coordinator/participants/' +
                        selectedEvent._id
                    );

                }


                // -----------------------------------------
                // Load participants
                // -----------------------------------------

                $scope.loadParticipants();


                // -----------------------------------------
                // Load OD
                // -----------------------------------------

                $scope.loadOD();

            };


        // =================================================
        // EVENT CHANGE
        // =================================================

        $scope.onEventChange =
            function () {

                const selected =
                    $scope.events.find(
                        function (event) {

                            return (
                                event._id ===
                                $scope.selectedEventId
                            );

                        }
                    );


                if (selected) {

                    $scope.selectEvent(
                        selected,
                        true
                    );

                }

            };


        // =================================================
        // LOAD PARTICIPANTS
        // =================================================

        $scope.loadParticipants =
            function () {

                if (
                    !$scope.selectedEventId
                ) {
                    return;
                }


                $scope.loadingParticipants =
                    true;

                $scope.errorMessage =
                    '';


                RegistrationService
                    .getEventParticipants(
                        $scope.selectedEventId
                    )

                    .then(function (response) {

                        if (
                            response.data &&
                            response.data.success
                        ) {

                            $scope.participants =
                                response.data.participants ||
                                [];

                            $scope.applySearch();

                        } else {

                            $scope.participants =
                                [];

                            $scope.filteredParticipants =
                                [];

                            $scope.errorMessage =
                                (
                                    response.data &&
                                    response.data.message
                                ) ||
                                'Unable to load participants.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Participants Error:',
                            error
                        );

                        $scope.participants =
                            [];

                        $scope.filteredParticipants =
                            [];

                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to load participants.';

                    })

                    .finally(function () {

                        $scope.loadingParticipants =
                            false;

                    });

            };


        // =================================================
        // LOAD OD
        // =================================================

        $scope.loadOD =
            function () {

                if (
                    !$scope.selectedEventId
                ) {
                    return;
                }


                $scope.loadingOD =
                    true;

                $scope.odDocument =
                    null;


                ODService
                    .getEventOD(
                        $scope.selectedEventId
                    )

                    .then(function (response) {

                        if (
                            response.data &&
                            response.data.success
                        ) {

                            $scope.odDocument =
                                response.data.od || null;

                        } else {

                            $scope.odDocument =
                                null;

                        }

                    })

                    .catch(function (error) {

                        /*
                        404 means that no signed
                        OD has been uploaded yet.
                        */

                        if (
                            error.status !== 404
                        ) {

                            console.error(
                                'Load OD Error:',
                                error
                            );

                        }

                        $scope.odDocument =
                            null;

                    })

                    .finally(function () {

                        $scope.loadingOD =
                            false;

                    });

            };


        // =================================================
        // SEARCH
        // =================================================

        $scope.applySearch =
            function () {

                const search =
                    String(
                        $scope.searchText ||
                        ''
                    )
                        .toLowerCase()
                        .trim();


                if (!search) {

                    $scope.filteredParticipants =
                        $scope.participants;

                    return;

                }


                $scope.filteredParticipants =
                    $scope.participants.filter(
                        function (participant) {

                            return (

                                String(
                                    participant.studentName ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(
                                    participant.studentEmail ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(
                                    participant.rollNumber ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(
                                    participant.studentPhone ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(search)

                            );

                        }
                    );

            };


        // =================================================
        // PRESENT COUNT
        // =================================================

        $scope.getPresentCount =
            function () {

                return $scope.participants.filter(
                    function (participant) {

                        return String(
                            participant.attendance ||
                            ''
                        ).toLowerCase() ===
                            'present';

                    }
                ).length;

            };


        // =================================================
        // ABSENT COUNT
        // =================================================

        $scope.getAbsentCount =
            function () {

                return (
                    $scope.participants.length -
                    $scope.getPresentCount()
                );

            };


        // =================================================
        // ATTENDANCE PERCENTAGE
        // =================================================

        $scope.getAttendancePercentage =
            function () {

                const total =
                    $scope.participants.length;


                if (!total) {
                    return 0;
                }


                return Math.round(
                    (
                        $scope.getPresentCount() /
                        total
                    ) * 100
                );

            };


        // =================================================
        // MARK ATTENDANCE
        // =================================================

        $scope.updateAttendance =
            function (
                participant,
                attendance
            ) {

                if (
                    !participant ||
                    !participant._id
                ) {
                    return;
                }


                $scope.updatingAttendanceId =
                    participant._id;

                $scope.errorMessage =
                    '';

                $scope.successMessage =
                    '';


                RegistrationService
                    .updateAttendance(
                        participant._id,
                        attendance
                    )

                    .then(function (response) {

                        if (
                            response.data &&
                            response.data.success
                        ) {

                            participant.attendance =
                                attendance;


                            if (
                                attendance ===
                                'present'
                            ) {

                                participant.status =
                                    'attended';

                            } else {

                                participant.status =
                                    'upcoming';

                            }


                            $scope.successMessage =
                                'Attendance updated successfully.';

                        } else {

                            $scope.errorMessage =
                                (
                                    response.data &&
                                    response.data.message
                                ) ||
                                'Unable to update attendance.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Attendance Error:',
                            error
                        );

                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to update attendance.';

                    })

                    .finally(function () {

                        $scope.updatingAttendanceId =
                            null;

                    });

            };


        // =================================================
        // SAVE ATTENDANCE
        // =================================================

        $scope.saveAttendance =
            async function () {

                if (
                    !$scope.participants.length
                ) {

                    $scope.errorMessage =
                        'There are no participants to save.';

                    return;

                }


                $scope.savingAttendance =
                    true;

                $scope.errorMessage =
                    '';

                $scope.successMessage =
                    '';


                try {

                    for (
                        const participant
                        of $scope.participants
                    ) {

                        if (
                            !participant._id
                        ) {
                            continue;
                        }


                        await RegistrationService
                            .updateAttendance(
                                participant._id,
                                participant.attendance ||
                                'absent'
                            );

                    }


                    $scope.successMessage =
                        'Attendance saved successfully.';

                }

                catch (error) {

                    console.error(
                        'Save Attendance Error:',
                        error
                    );

                    $scope.errorMessage =
                        (
                            error.data &&
                            error.data.message
                        ) ||
                        'Unable to save attendance.';

                }

                finally {

                    $scope.savingAttendance =
                        false;

                    $scope.$applyAsync();

                }

            };


        // =================================================
        // OPEN OD PDF
        // =================================================

        $scope.openODPdf =
            function () {

                if (
                    !$scope.odDocument ||
                    !$scope.selectedEventId
                ) {

                    $scope.errorMessage =
                        'No signed OD PDF uploaded for this event.';

                    return;

                }


                /*
                Open a blank tab immediately.

                The API requires JWT authentication,
                so window.open() cannot directly open
                the API URL.
                */

                const previewWindow =
                    $window.open(
                        '',
                        '_blank'
                    );


                if (!previewWindow) {

                    $scope.errorMessage =
                        'Please allow pop-ups to view the OD PDF.';

                    return;

                }


                $scope.loadingOD =
                    true;

                $scope.errorMessage =
                    '';


                ODService
                    .downloadOD(
                        $scope.selectedEventId
                    )

                    .then(function (response) {

                        const blob =
                            new Blob(
                                [response.data],
                                {
                                    type:
                                        'application/pdf'
                                }
                            );


                        const pdfUrl =
                            URL.createObjectURL(
                                blob
                            );


                        previewWindow.location.href =
                            pdfUrl;


                        /*
                        Release the temporary
                        object URL later.
                        */

                        $window.setTimeout(
                            function () {

                                URL.revokeObjectURL(
                                    pdfUrl
                                );

                            },
                            60000
                        );

                    })

                    .catch(function (error) {

                        console.error(
                            'Open OD Error:',
                            error
                        );


                        previewWindow.close();


                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to open OD PDF.';

                    })

                    .finally(function () {

                        $scope.loadingOD =
                            false;

                    });

            };


        // =================================================
        // SELECT OD FILE
        // =================================================

        $scope.selectODFile =
            function (files) {

                if (
                    !files ||
                    !files.length
                ) {
                    return;
                }


                const file =
                    files[0];


                // -----------------------------------------
                // Check PDF
                // -----------------------------------------

                const isPDF =
                    file.type ===
                    'application/pdf' ||
                    /\.pdf$/i.test(
                        file.name
                    );


                if (!isPDF) {

                    $scope.$applyAsync(
                        function () {

                            $scope.errorMessage =
                                'Please select a PDF file.';

                            $scope.selectedODFile =
                                null;

                        }
                    );

                    return;

                }


                // -----------------------------------------
                // Check file size
                // -----------------------------------------

                const maxSize =
                    10 * 1024 * 1024;


                if (
                    file.size > maxSize
                ) {

                    $scope.$applyAsync(
                        function () {

                            $scope.errorMessage =
                                'PDF size must be 10 MB or less.';

                            $scope.selectedODFile =
                                null;

                        }
                    );

                    return;

                }


                // -----------------------------------------
                // Store file and automatically upload
                // -----------------------------------------

                $scope.$applyAsync(
                    function () {

                        $scope.selectedODFile =
                            file;

                        $scope.errorMessage =
                            '';

                        $scope.successMessage =
                            '';

                        /*
                        The user has already clicked
                        Open in the file chooser.

                        Automatically start uploading.
                        */

                        $scope.uploadODPdf();

                    }
                );

            };


        // =================================================
        // UPLOAD OD PDF
        // =================================================

        $scope.uploadODPdf =
            function () {

                if (
                    !$scope.selectedEventId
                ) {

                    $scope.errorMessage =
                        'Please select an event first.';

                    return;

                }


                if (
                    !$scope.selectedODFile
                ) {

                    $scope.errorMessage =
                        'Please select a PDF file first.';

                    return;

                }


                $scope.uploadingOD =
                    true;

                $scope.errorMessage =
                    '';

                $scope.successMessage =
                    '';


                ODService
                    .uploadOD(
                        $scope.selectedEventId,
                        $scope.selectedODFile
                    )

                    .then(function (response) {

                        console.log(
                            'OD Upload Response:',
                            response
                        );


                        if (
                            response.data &&
                            response.data.success
                        ) {

                            $scope.odDocument =
                                response.data.od || null;


                            $scope.successMessage =
                                'Signed OD PDF uploaded successfully.';


                            $scope.selectedODFile =
                                null;


                            // Reset file input

                            const fileInput =
                                document.getElementById(
                                    'odPdfInput'
                                );


                            if (fileInput) {

                                fileInput.value =
                                    '';

                            }

                        } else {

                            $scope.errorMessage =
                                (
                                    response.data &&
                                    response.data.message
                                ) ||
                                'Unable to upload OD PDF.';

                        }

                    })

                    .catch(function (error) {

                        console.error(
                            'Upload OD Error:',
                            error
                        );


                        $scope.errorMessage =
                            (
                                error.data &&
                                error.data.message
                            ) ||
                            'Unable to upload OD PDF.';

                    })

                    .finally(function () {

                        $scope.uploadingOD =
                            false;

                    });

            };


        // =================================================
        // OD FILE NAME
        // =================================================

        $scope.getODFileName =
            function () {

                if (
                    $scope.selectedODFile
                ) {

                    return $scope.selectedODFile.name;

                }


                if (
                    $scope.odDocument
                ) {

                    return $scope.odDocument.fileName;

                }


                return '';

            };


        // =================================================
        // FORMAT DATE
        // =================================================

        $scope.formatDate =
            function (date) {

                if (!date) {
                    return '-';
                }


                const parsedDate =
                    new Date(date);


                if (
                    isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    return '-';

                }


                return parsedDate.toLocaleDateString(
                    'en-IN',
                    {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }
                );

            };


        // =================================================
        // FORMAT TIME
        // =================================================

        $scope.formatTime =
            function (time) {

                if (!time) {
                    return '-';
                }


                if (
                    typeof time === 'string' &&
                    /^\d{2}:\d{2}$/.test(time)
                ) {

                    const parts =
                        time.split(':');


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


                const parsedTime =
                    new Date(time);


                if (
                    isNaN(
                        parsedTime.getTime()
                    )
                ) {

                    return time;
                }


                return parsedTime.toLocaleTimeString(
                    'en-IN',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            };


        // =================================================
        // ATTENDANCE CLASS
        // =================================================

        $scope.getAttendanceClass =
            function (attendance) {

                attendance =
                    String(
                        attendance || ''
                    ).toLowerCase();


                if (
                    attendance ===
                    'present'
                ) {

                    return 'bg-success-subtle text-success';

                }


                return 'bg-danger-subtle text-danger';

            };


        // =================================================
        // ATTENDANCE TEXT
        // =================================================

        $scope.getAttendanceText =
            function (attendance) {

                attendance =
                    String(
                        attendance ||
                        'absent'
                    );


                return (
                    attendance
                        .charAt(0)
                        .toUpperCase() +
                    attendance.slice(1)
                );

            };


        // =================================================
        // CSV ESCAPE
        // =================================================

        function escapeCSV(value) {

            value =
                value === null ||
                value === undefined
                    ? ''
                    : String(value);


            value =
                value.replace(
                    /"/g,
                    '""'
                );


            return '"' +
                value +
                '"';

        }


        // =================================================
        // DOWNLOAD CSV
        // =================================================

        function downloadCSV(
            filename,
            rows
        ) {

            const csv =
                rows
                    .map(
                        function (row) {

                            return row
                                .map(
                                    escapeCSV
                                )
                                .join(',');

                        }
                    )
                    .join('\n');


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            'text/csv;charset=utf-8;'
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;


            link.download =
                filename;


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );

        }


        // =================================================
        // REGISTERED STUDENTS CSV
        // =================================================

        $scope.downloadRegisteredCSV =
            function () {

                if (
                    !$scope.event
                ) {
                    return;
                }


                const rows = [

                    [
                        'Name',
                        'Email',
                        'Roll Number',
                        'Year',
                        'Department',
                        'Phone',
                        'Registration ID',
                        'Attendance'
                    ]

                ];


                $scope.participants.forEach(
                    function (participant) {

                        rows.push([

                            participant.studentName ||
                                '',

                            participant.studentEmail ||
                                '',

                            participant.rollNumber ||
                                '',

                            participant.year ||
                                '',

                            participant.studentDept ||
                                '',

                            participant.studentPhone ||
                                '',

                            participant.registrationId ||
                                '',

                            participant.attendance ||
                                'absent'

                        ]);

                    }
                );


                downloadCSV(
                    (
                        $scope.event.title ||
                        'event'
                    )
                        .replace(
                            /[^a-z0-9]/gi,
                            '_'
                        ) +
                    '_registered_students.csv',
                    rows
                );

            };


        // =================================================
        // PARTICIPATED STUDENTS CSV
        // =================================================

        $scope.downloadParticipatedCSV =
            function () {

                if (
                    !$scope.event
                ) {
                    return;
                }


                const rows = [

                    [
                        'Name',
                        'Email',
                        'Roll Number',
                        'Year',
                        'Department',
                        'Phone',
                        'Registration ID',
                        'Attendance'
                    ]

                ];


                $scope.participants
                    .filter(
                        function (participant) {

                            return String(
                                participant.attendance ||
                                ''
                            ).toLowerCase() ===
                                'present';

                        }
                    )
                    .forEach(
                        function (participant) {

                            rows.push([

                                participant.studentName ||
                                    '',

                                participant.studentEmail ||
                                    '',

                                participant.rollNumber ||
                                    '',

                                participant.year ||
                                    '',

                                participant.studentDept ||
                                    '',

                                participant.studentPhone ||
                                    '',

                                participant.registrationId ||
                                    '',

                                'Present'

                            ]);

                        }
                    );


                downloadCSV(
                    (
                        $scope.event.title ||
                        'event'
                    )
                        .replace(
                            /[^a-z0-9]/gi,
                            '_'
                        ) +
                    '_participated_students.csv',
                    rows
                );

            };


        // =================================================
        // REFRESH
        // =================================================

        $scope.refresh =
            function () {

                $scope.successMessage =
                    '';

                $scope.errorMessage =
                    '';

                $scope.loadParticipants();

                $scope.loadOD();

            };


        // =================================================
        // BACK
        // =================================================

        $scope.goBack =
            function () {

                $window.history.back();

            };


        // =================================================
        // INITIAL LOAD
        // =================================================

        $scope.loadEvents();

    }
);