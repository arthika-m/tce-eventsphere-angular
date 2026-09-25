const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');


/*
========================================================
HELPER FUNCTIONS
========================================================
*/

/*
--------------------------------------------------------
NORMALIZE VISIBILITY
--------------------------------------------------------
This allows values such as:

Department
department
DepartmentOnly
DepartmentWide

CollegeWide
College-Wide
College
OpenToAll
Open-to-All
--------------------------------------------------------
*/
const normalizeVisibility = (visibility) => {

    return String(visibility || '')
        .toLowerCase()
        .replace(/[\s_-]/g, '');

};


/*
--------------------------------------------------------
CHECK WHETHER EVENT IS COLLEGE-WIDE
--------------------------------------------------------
--------------------------------------------------------
*/
const isCollegeWideEvent = (visibility) => {

    const normalized =
        normalizeVisibility(visibility);

    return (
        normalized === 'collegewide' ||
        normalized === 'college' ||
        normalized === 'opentoall' ||
        normalized === 'open'
    );

};


/*
--------------------------------------------------------
CHECK WHETHER EVENT IS DEPARTMENT EVENT
--------------------------------------------------------
*/
const isDepartmentEvent = (visibility) => {

    const normalized =
        normalizeVisibility(visibility);

    return (
        normalized === 'department' ||
        normalized === 'departmentonly' ||
        normalized === 'departmentwide'
    );

};


/*
========================================================
CREATE EVENT
POST /api/events
========================================================
*/
const createEvent = async (req, res) => {

    try {

        console.log(
            '\n========== CREATE EVENT REQUEST =========='
        );

        console.log(
            'Request Body:',
            req.body
        );

        console.log(
            'Logged-in User:',
            req.user
        );


        /*
        ------------------------------------------------
        SUPPORT BOTH:
        req.body
        req.body.event
        ------------------------------------------------
        */
        const data =
            req.body.event ||
            req.body;


        /*
        ------------------------------------------------
        FIND LOGGED-IN COORDINATOR
        ------------------------------------------------
        */
        const coordinator =
            await User.findById(
                req.user.id
            );


        if (!coordinator) {

            return res.status(404).json({

                success: false,

                message:
                    'Coordinator not found.'

            });

        }


        /*
        ------------------------------------------------
        ONLY COORDINATOR CAN CREATE
        ------------------------------------------------
        */
        if (
            coordinator.role !==
            'coordinator'
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'Only coordinators can create events.'

            });

        }


        /*
        ========================================================
        IMPORTANT
        ========================================================
        THE EVENT DEPARTMENT MUST ALWAYS COME FROM THE
        LOGGED-IN COORDINATOR.

        We DO NOT trust department sent from frontend.

        Example:
        IT Coordinator -> IT event
        ECE Coordinator -> ECE event
        ========================================================
        */

        const department =
            String(
                coordinator.department || ''
            ).trim();


        /*
        ------------------------------------------------
        REQUIRED FIELDS
        ------------------------------------------------
        */
        const requiredFields = [

            'title',
            'description',
            'clubName',
            'category',
            'venue',
            'eventDate',
            'eventTime',
            'regStartDate',
            'regStartTime',
            'regEndDate',
            'regEndTime',
            'visibility'

        ];


        const missingFields = [];


        requiredFields.forEach(
            (field) => {

                if (

                    data[field] ===
                    undefined ||

                    data[field] ===
                    null ||

                    String(
                        data[field]
                    ).trim() === ''

                ) {

                    missingFields.push(
                        field
                    );

                }

            }
        );


        /*
        ------------------------------------------------
        DEPARTMENT IS REQUIRED
        ------------------------------------------------
        */
        if (!department) {

            missingFields.push(
                'department'
            );

        }


        if (
            missingFields.length > 0
        ) {

            console.log(
                'Missing fields:',
                missingFields
            );


            return res.status(400).json({

                success: false,

                message:
                    'Please fill all required event fields.',

                missingFields

            });

        }


        /*
        ------------------------------------------------
        REGISTRATION TYPE
        ------------------------------------------------
        */
        let registrationType =
            data.registrationType ||
            'BuiltIn';


        if (

            String(
                registrationType
            ).toLowerCase() ===
            'external'

        ) {

            registrationType =
                'External';

        } else {

            registrationType =
                'BuiltIn';

        }


        /*
        ------------------------------------------------
        EXTERNAL REGISTRATION VALIDATION
        ------------------------------------------------
        */
        if (
            registrationType ===
            'External'
        ) {

            if (

                !data.registrationLink ||

                String(
                    data.registrationLink
                ).trim() === ''

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Registration link is required for external registration.'

                });

            }

        }


        /*
        ------------------------------------------------
        BUILT-IN REGISTRATION VALIDATION
        ------------------------------------------------
        */
        if (
            registrationType ===
            'BuiltIn'
        ) {

            if (

                data.unlimitedSeats !==
                    true &&

                data.unlimitedSeats !==
                    'true' &&

                (

                    data.maxSeats ===
                        undefined ||

                    data.maxSeats ===
                        null ||

                    String(
                        data.maxSeats
                    ).trim() === ''

                )

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Please enter maximum seats or select unlimited seats.'

                });

            }

        }


        /*
        ========================================================
        CREATE EVENT
        ========================================================
        */
        const event =
            await Event.create({

                title:
                    data.title,

                description:
                    data.description,

                /*
                IMPORTANT:
                Always coordinator department
                */
                department:
                    department,

                category:
                    data.category,

                clubName:
                    data.clubName,

                venue:
                    data.venue,

                eventDate:
                    data.eventDate,

                eventTime:
                    data.eventTime,

                regStartDate:
                    data.regStartDate,

                regStartTime:
                    data.regStartTime,

                regEndDate:
                    data.regEndDate,

                regEndTime:
                    data.regEndTime,

                maxSeats:
                    data.maxSeats === '' ||
                    data.maxSeats === null ||
                    data.maxSeats === undefined
                        ? 0
                        : Number(
                            data.maxSeats
                        ),

                unlimitedSeats:
                    data.unlimitedSeats === true ||
                    data.unlimitedSeats === 'true',

                registrationType:
                    registrationType,

                registrationLink:
                    registrationType ===
                    'External'
                        ? data.registrationLink
                        : '',

                posterURL:
                    data.posterURL ||
                    '',

                posterType:
                    data.posterType ||
                    'image',

                visibility:
                    data.visibility,

                createdBy:
                    coordinator._id,

                registeredSeats:
                    0,

                odPdfURL:
                    data.odPdfURL ||
                    ''

            });


        console.log(
            'Event created successfully:',
            event._id
        );

        console.log(
            'Event Department:',
            event.department
        );

        console.log(
            'Event Visibility:',
            event.visibility
        );


        /*
        ========================================================
        CREATE NOTIFICATIONS
        ========================================================
        */

        try {

            const visibility =
                normalizeVisibility(
                    event.visibility
                );


            /*
            ------------------------------------------------
            DEPARTMENT EVENT
            -> SAME DEPARTMENT STUDENTS ONLY
            ------------------------------------------------
            */
            let studentQuery = {

                role:
                    'student'

            };


            if (
                isDepartmentEvent(
                    event.visibility
                )
            ) {

                studentQuery.department =
                    event.department;


                console.log(
                    'Notification audience: Department students'
                );

                console.log(
                    'Department:',
                    event.department
                );

            } else {

                /*
                ------------------------------------------------
                COLLEGE-WIDE / OPEN-TO-ALL
                -> ALL STUDENTS
                ------------------------------------------------
                */

                console.log(
                    'Notification audience: All students'
                );

            }


            const students =
                await User.find(
                    studentQuery
                )
                    .select(
                        '_id name email department'
                    );


            console.log(
                'Students to notify:',
                students.length
            );


            if (
                students.length > 0
            ) {

                const notifications =
                    students.map(
                        function (
                            student
                        ) {

                            return {

                                userId:
                                    student._id,

                                title:
                                    'New Event: ' +
                                    event.title,

                                message:
                                    'A new event has been published. Check the event details and register if eligible.',

                                type:
                                    'event',

                                eventId:
                                    event._id,

                                isRead:
                                    false

                            };

                        }
                    );


                await Notification.insertMany(
                    notifications
                );


                console.log(
                    'Notifications created successfully:',
                    notifications.length
                );

            } else {

                console.log(
                    'No students found for notification.'
                );

            }

        } catch (
            notificationError
        ) {

            console.error(
                'Notification Creation Error:',
                notificationError
            );

        }


        /*
        ------------------------------------------------
        FINAL RESPONSE
        ------------------------------------------------
        */
        return res.status(201).json({

            success: true,

            message:
                'Event created successfully.',

            event:
                event

        });


    } catch (error) {

        console.error(
            'Create Event Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to create event.',

            error:
                error.message

        });

    }

};


/*
========================================================
GET ALL EVENTS
GET /api/events
========================================================

This endpoint is kept for coordinator-side pages.

Student pages should use the dedicated student
endpoints below.
========================================================
*/
const getEvents = async (
    req,
    res
) => {

    try {

        const events =
            await Event.find()
                .populate(
                    'createdBy',
                    'name email department'
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                events.length,

            events:
                events

        });


    } catch (error) {

        console.error(
            'Get Events Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to fetch events.',

            error:
                error.message

        });

    }

};


/*
========================================================
GET STUDENT DEPARTMENT EVENTS
GET /api/events/student/department
========================================================

Only events belonging to the logged-in student's
department are returned.
========================================================
*/
const getStudentDepartmentEvents =
    async (
        req,
        res
    ) => {

        try {

            /*
            ------------------------------------------------
            FIND LOGGED-IN STUDENT
            ------------------------------------------------
            */
            const student =
                await User.findById(
                    req.user.id
                );


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Student not found.'

                });

            }


            if (
                student.role !==
                'student'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Only students can access department events.'

                });

            }


            const department =
                String(
                    student.department || ''
                ).trim();


            if (!department) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Student department is not available.'

                });

            }


            /*
            ------------------------------------------------
            FIND ONLY SAME-DEPARTMENT EVENTS
            ------------------------------------------------
            */
            const events =
                await Event.find({

                    department:
                        department,

                    $or: [

                        {
                            visibility:
                                'Department'
                        },

                        {
                            visibility:
                                'DepartmentOnly'
                        },

                        {
                            visibility:
                                'DepartmentWide'
                        },

                        {
                            visibility:
                                'department'
                        },

                        {
                            visibility:
                                'departmentonly'
                        },

                        {
                            visibility:
                                'departmentwide'
                        }

                    ]

                })
                    .populate(
                        'createdBy',
                        'name email department'
                    )
                    .sort({
                        eventDate: 1,
                        createdAt: -1
                    });


            console.log(
                'Student Department:',
                department
            );

            console.log(
                'Department Events Found:',
                events.length
            );


            return res.status(200).json({

                success: true,

                department:
                    department,

                count:
                    events.length,

                events:
                    events

            });


        } catch (error) {

            console.error(
                'Get Student Department Events Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to fetch department events.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
GET STUDENT COLLEGE-WIDE EVENTS
GET /api/events/student/college
========================================================

College-wide events are visible to all students.
========================================================
*/
const getStudentCollegeEvents =
    async (
        req,
        res
    ) => {

        try {

            /*
            ------------------------------------------------
            FIND LOGGED-IN STUDENT
            ------------------------------------------------
            */
            const student =
                await User.findById(
                    req.user.id
                );


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Student not found.'

                });

            }


            if (
                student.role !==
                'student'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Only students can access college-wide events.'

                });

            }


            /*
            ------------------------------------------------
            FIND ONLY COLLEGE-WIDE EVENTS
            ------------------------------------------------
            */
            const events =
                await Event.find({

                    $or: [

                        {
                            visibility:
                                'CollegeWide'
                        },

                        {
                            visibility:
                                'College-Wide'
                        },

                        {
                            visibility:
                                'College'
                        },

                        {
                            visibility:
                                'OpenToAll'
                        },

                        {
                            visibility:
                                'Open-to-All'
                        },

                        {
                            visibility:
                                'Open'
                        },

                        {
                            visibility:
                                'collegewide'
                        },

                        {
                            visibility:
                                'college-wide'
                        },

                        {
                            visibility:
                                'college'
                        },

                        {
                            visibility:
                                'opentoall'
                        },

                        {
                            visibility:
                                'open-to-all'
                        },

                        {
                            visibility:
                                'open'
                        }

                    ]

                })
                    .populate(
                        'createdBy',
                        'name email department'
                    )
                    .sort({
                        eventDate: 1,
                        createdAt: -1
                    });


            console.log(
                'College-Wide Events Found:',
                events.length
            );


            return res.status(200).json({

                success: true,

                count:
                    events.length,

                events:
                    events

            });


        } catch (error) {

            console.error(
                'Get Student College Events Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to fetch college-wide events.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
GET STUDENT DASHBOARD EVENTS
GET /api/events/student/dashboard
========================================================

Dashboard should show:

1. Student's own department events
2. College-wide events

It should NOT show another department's events.
========================================================
*/
const getStudentDashboardEvents =
    async (
        req,
        res
    ) => {

        try {

            /*
            ------------------------------------------------
            FIND LOGGED-IN STUDENT
            ------------------------------------------------
            */
            const student =
                await User.findById(
                    req.user.id
                );


            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Student not found.'

                });

            }


            if (
                student.role !==
                'student'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Only students can access the student dashboard.'

                });

            }


            const department =
                String(
                    student.department || ''
                ).trim();


            if (!department) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Student department is not available.'

                });

            }


            /*
            ========================================================
            DASHBOARD FILTER
            ========================================================

            Show:

            department = logged-in student's department
            AND visibility = department

            OR

            visibility = college-wide
            ========================================================
            */
            const events =
                await Event.find({

                    $or: [

                        /*
                        ----------------------------------------
                        SAME DEPARTMENT EVENTS
                        ----------------------------------------
                        */
                        {
                            department:
                                department,

                            $or: [

                                {
                                    visibility:
                                        'Department'
                                },

                                {
                                    visibility:
                                        'DepartmentOnly'
                                },

                                {
                                    visibility:
                                        'DepartmentWide'
                                },

                                {
                                    visibility:
                                        'department'
                                },

                                {
                                    visibility:
                                        'departmentonly'
                                },

                                {
                                    visibility:
                                        'departmentwide'
                                }

                            ]

                        },


                        /*
                        ----------------------------------------
                        COLLEGE-WIDE EVENTS
                        ----------------------------------------
                        */
                        {
                            $or: [

                                {
                                    visibility:
                                        'CollegeWide'
                                },

                                {
                                    visibility:
                                        'College-Wide'
                                },

                                {
                                    visibility:
                                        'College'
                                },

                                {
                                    visibility:
                                        'OpenToAll'
                                },

                                {
                                    visibility:
                                        'Open-to-All'
                                },

                                {
                                    visibility:
                                        'Open'
                                },

                                {
                                    visibility:
                                        'collegewide'
                                },

                                {
                                    visibility:
                                        'college-wide'
                                },

                                {
                                    visibility:
                                        'college'
                                },

                                {
                                    visibility:
                                        'opentoall'
                                },

                                {
                                    visibility:
                                        'open-to-all'
                                },

                                {
                                    visibility:
                                        'open'
                                }

                            ]

                        }

                    ]

                })
                    .populate(
                        'createdBy',
                        'name email department'
                    )
                    .sort({
                        eventDate: 1,
                        createdAt: -1
                    });


            console.log(
                'Student Dashboard Department:',
                department
            );

            console.log(
                'Student Dashboard Events:',
                events.length
            );


            return res.status(200).json({

                success: true,

                department:
                    department,

                count:
                    events.length,

                events:
                    events

            });


        } catch (error) {

            console.error(
                'Get Student Dashboard Events Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to fetch student dashboard events.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
GET SINGLE EVENT
GET /api/events/:id
========================================================

For students:
- Department event -> same department only
- College-wide -> all students

For coordinators:
- Can view event normally.
========================================================
*/
const getEventById =
    async (
        req,
        res
    ) => {

        try {

            const event =
                await Event.findById(
                    req.params.id
                )
                    .populate(
                        'createdBy',
                        'name email department'
                    );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Event not found.'

                });

            }


            /*
            ------------------------------------------------
            STUDENT ACCESS CHECK
            ------------------------------------------------
            */
            if (
                req.user &&
                req.user.role ===
                'student'
            ) {

                const student =
                    await User.findById(
                        req.user.id
                    );


                if (!student) {

                    return res.status(404).json({

                        success: false,

                        message:
                            'Student not found.'

                    });

                }


                /*
                --------------------------------------------
                COLLEGE-WIDE EVENT
                --------------------------------------------
                */
                if (
                    isCollegeWideEvent(
                        event.visibility
                    )
                ) {

                    return res.status(200).json({

                        success: true,

                        event:
                            event

                    });

                }


                /*
                --------------------------------------------
                DEPARTMENT EVENT
                --------------------------------------------
                */
                if (
                    isDepartmentEvent(
                        event.visibility
                    )
                ) {

                    const studentDepartment =
                        String(
                            student.department || ''
                        ).trim();


                    const eventDepartment =
                        String(
                            event.department || ''
                        ).trim();


                    if (
                        studentDepartment
                            .toLowerCase() !==
                        eventDepartment
                            .toLowerCase()
                    ) {

                        return res.status(403).json({

                            success: false,

                            message:
                                'You do not have access to this department event.'

                        });

                    }


                    return res.status(200).json({

                        success: true,

                        event:
                            event

                    });

                }


                /*
                --------------------------------------------
                UNKNOWN VISIBILITY
                --------------------------------------------
                Do not expose it to students.
                --------------------------------------------
                */
                return res.status(403).json({

                    success: false,

                    message:
                        'You do not have access to this event.'

                });

            }


            /*
            ------------------------------------------------
            COORDINATOR ACCESS
            ------------------------------------------------
            */
            return res.status(200).json({

                success: true,

                event:
                    event

            });


        } catch (error) {

            console.error(
                'Get Event Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to fetch event.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
UPDATE / EDIT EVENT
PUT /api/events/:id
========================================================
*/
const updateEvent =
    async (
        req,
        res
    ) => {

        try {

            console.log(
                '\n========== UPDATE EVENT REQUEST =========='
            );


            console.log(
                'Event ID:',
                req.params.id
            );


            console.log(
                'Request Body:',
                req.body
            );


            console.log(
                'Logged-in User:',
                req.user
            );


            const event =
                await Event.findById(
                    req.params.id
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Event not found.'

                });

            }


            /*
            ------------------------------------------------
            ONLY EVENT CREATOR CAN EDIT
            ------------------------------------------------
            */
            if (

                !event.createdBy ||

                event.createdBy.toString() !==
                req.user.id

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'You can only edit your own events.'

                });

            }


            const coordinator =
                await User.findById(
                    req.user.id
                );


            if (!coordinator) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Coordinator not found.'

                });

            }


            const data =
                req.body.event ||
                req.body;


            /*
            ------------------------------------------------
            REGISTRATION TYPE
            ------------------------------------------------
            */
            let registrationType =
                data.registrationType !==
                undefined

                    ? data.registrationType

                    : event.registrationType;


            if (

                String(
                    registrationType
                ).toLowerCase() ===
                'external'

            ) {

                registrationType =
                    'External';

            } else {

                registrationType =
                    'BuiltIn';

            }


            /*
            ------------------------------------------------
            EXTERNAL LINK VALIDATION
            ------------------------------------------------
            */
            if (
                registrationType ===
                'External'
            ) {

                if (

                    !data.registrationLink ||

                    String(
                        data.registrationLink
                    ).trim() === ''

                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            'Registration link is required for external registration.'

                    });

                }

            }


            /*
            ========================================================
            UPDATE DATA
            ========================================================
            IMPORTANT:
            Department is NOT taken from frontend.

            The event remains under the coordinator's
            department.
            ========================================================
            */
            const updateData = {

                title:
                    data.title !==
                    undefined

                        ? data.title

                        : event.title,


                description:
                    data.description !==
                    undefined

                        ? data.description

                        : event.description,


                department:
                    String(
                        coordinator.department ||
                        event.department ||
                        ''
                    ).trim(),


                category:
                    data.category !==
                    undefined

                        ? data.category

                        : event.category,


                clubName:
                    data.clubName !==
                    undefined

                        ? data.clubName

                        : event.clubName,


                venue:
                    data.venue !==
                    undefined

                        ? data.venue

                        : event.venue,


                eventDate:
                    data.eventDate !==
                    undefined

                        ? data.eventDate

                        : event.eventDate,


                eventTime:
                    data.eventTime !==
                    undefined

                        ? data.eventTime

                        : event.eventTime,


                regStartDate:
                    data.regStartDate !==
                    undefined

                        ? data.regStartDate

                        : event.regStartDate,


                regStartTime:
                    data.regStartTime !==
                    undefined

                        ? data.regStartTime

                        : event.regStartTime,


                regEndDate:
                    data.regEndDate !==
                    undefined

                        ? data.regEndDate

                        : event.regEndDate,


                regEndTime:
                    data.regEndTime !==
                    undefined

                        ? data.regEndTime

                        : event.regEndTime,


                maxSeats:
                    data.maxSeats !==
                        undefined &&
                    data.maxSeats !== ''

                        ? Number(
                            data.maxSeats
                        )

                        : 0,


                unlimitedSeats:
                    data.unlimitedSeats !==
                    undefined

                        ? (
                            data.unlimitedSeats ===
                                true ||

                            data.unlimitedSeats ===
                                'true'
                        )

                        : event.unlimitedSeats,


                registrationType:
                    registrationType,


                registrationLink:
                    registrationType ===
                    'External'

                        ? data.registrationLink

                        : '',


                posterURL:
                    data.posterURL !==
                    undefined

                        ? data.posterURL

                        : event.posterURL,


                posterType:
                    data.posterType !==
                    undefined

                        ? data.posterType

                        : event.posterType,


                visibility:
                    data.visibility !==
                    undefined

                        ? data.visibility

                        : event.visibility,


                odPdfURL:
                    data.odPdfURL !==
                    undefined

                        ? data.odPdfURL

                        : event.odPdfURL

            };


            /*
            ------------------------------------------------
            KEEP REGISTERED SEATS
            ------------------------------------------------
            */
            updateData.registeredSeats =
                event.registeredSeats ||
                0;


            /*
            ------------------------------------------------
            UPDATE DATABASE
            ------------------------------------------------
            */
            const updatedEvent =
                await Event.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,
                        runValidators: true
                    }

                )
                    .populate(
                        'createdBy',
                        'name email department'
                    );


            console.log(
                'Event updated successfully:',
                updatedEvent._id
            );


            return res.status(200).json({

                success: true,

                message:
                    'Event updated successfully.',

                event:
                    updatedEvent

            });


        } catch (error) {

            console.error(
                'Update Event Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to update event.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
DELETE EVENT
DELETE /api/events/:id
========================================================
*/
const deleteEvent =
    async (
        req,
        res
    ) => {

        try {

            console.log(
                '\n========== DELETE EVENT REQUEST =========='
            );


            console.log(
                'Event ID:',
                req.params.id
            );


            console.log(
                'Logged-in User:',
                req.user
            );


            const event =
                await Event.findById(
                    req.params.id
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Event not found.'

                });

            }


            /*
            ------------------------------------------------
            ONLY EVENT CREATOR CAN DELETE
            ------------------------------------------------
            */
            if (

                !event.createdBy ||

                event.createdBy.toString() !==
                req.user.id

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'You can only delete your own events.'

                });

            }


            await Event.findByIdAndDelete(
                req.params.id
            );


            console.log(
                'Event deleted successfully.'
            );


            return res.status(200).json({

                success: true,

                message:
                    'Event deleted successfully.'

            });


        } catch (error) {

            console.error(
                'Delete Event Error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to delete event.',

                error:
                    error.message

            });

        }

    };


/*
========================================================
EXPORT CONTROLLERS
========================================================
*/
module.exports = {

    createEvent,

    getEvents,

    getStudentDashboardEvents,

    getStudentDepartmentEvents,

    getStudentCollegeEvents,

    getEventById,

    updateEvent,

    deleteEvent

};