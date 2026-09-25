const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');


// ============================================================
// GENERATE REGISTRATION ID
// ============================================================

const generateRegistrationId = async (department) => {

    const deptCode =
        department
            ? department
                .replace(/[^A-Za-z]/g, '')
                .substring(0, 2)
                .toUpperCase()
            : 'TC';

    let registrationId;
    let exists = true;

    while (exists) {

        const randomNumber =
            Math.floor(100 + Math.random() * 900);

        registrationId =
            `TCE2026${deptCode}${randomNumber}`;

        exists =
            await Registration.findOne({
                registrationId
            });
    }

    return registrationId;
};


// ============================================================
// STUDENT REGISTER FOR EVENT
// POST /api/registrations
// ============================================================

const registerForEvent = async (req, res) => {

    try {

        const {
            eventId,
            rollNumber,
            year
        } = req.body;


        // ----------------------------------------------------
        // CHECK EVENT ID
        // ----------------------------------------------------

        if (!eventId) {

            return res.status(400).json({
                success: false,
                message: 'Event ID is required.'
            });

        }


        // ----------------------------------------------------
        // FIND EVENT
        // ----------------------------------------------------

        const event =
            await Event.findById(eventId);


        if (!event) {

            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });

        }


        // ----------------------------------------------------
        // EXTERNAL REGISTRATION
        // ----------------------------------------------------

        if (
            String(event.registrationType)
                .toLowerCase() === 'external'
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'This event uses external registration. Please use the external registration confirmation option.'
            });

        }


        // ----------------------------------------------------
        // FIND LOGGED-IN STUDENT
        // ----------------------------------------------------

        const student =
            await User.findById(req.user.id);


        if (!student) {

            return res.status(404).json({
                success: false,
                message: 'Student account not found.'
            });

        }


        // ----------------------------------------------------
        // ROLE CHECK
        // ----------------------------------------------------

        if (student.role !== 'student') {

            return res.status(403).json({
                success: false,
                message:
                    'Only students can register for events.'
            });

        }


        // ----------------------------------------------------
        // CHECK DUPLICATE REGISTRATION
        // ----------------------------------------------------

        const existingRegistration =
            await Registration.findOne({
                studentId: student._id,
                eventId: event._id
            });


        if (existingRegistration) {

            return res.status(409).json({
                success: false,
                message:
                    'You have already registered for this event.',
                registration:
                    existingRegistration
            });

        }


        // ----------------------------------------------------
        // CHECK CAPACITY
        // ----------------------------------------------------

        if (!event.unlimitedSeats) {

            const registeredSeats =
                Number(event.registeredSeats || 0);

            const maxSeats =
                Number(event.maxSeats || 0);


            if (
                maxSeats > 0 &&
                registeredSeats >= maxSeats
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Registration is full for this event.'
                });

            }

        }


        // ----------------------------------------------------
        // CHECK REGISTRATION PERIOD
        // ----------------------------------------------------

        const now = new Date();

        const registrationStart =
            combineDateAndTime(
                event.regStartDate,
                event.regStartTime
            );

        const registrationEnd =
            combineDateAndTime(
                event.regEndDate,
                event.regEndTime
            );


        if (
            registrationStart &&
            now < registrationStart
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Registration has not started yet.'
            });

        }


        if (
            registrationEnd &&
            now > registrationEnd
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Registration has already closed.'
            });

        }


        // ----------------------------------------------------
        // GENERATE REGISTRATION ID
        // ----------------------------------------------------

        const registrationId =
            await generateRegistrationId(
                student.department
            );


        // ----------------------------------------------------
        // CREATE INTERNAL REGISTRATION
        // ----------------------------------------------------

        const registration =
            await Registration.create({

                registrationId,

                studentId:
                    student._id,

                studentName:
                    student.name,

                studentEmail:
                    student.email,

                studentDept:
                    student.department,

                studentPhone:
                    student.phone,

                rollNumber:
                    rollNumber || '',

                year:
                    year || '',

                eventId:
                    event._id,

                eventTitle:
                    event.title,

                // IMPORTANT
                registrationType:
                    'internal',

                registeredAt:
                    new Date(),

                status:
                    'upcoming',

                attendance:
                    'absent'

            });


        // ----------------------------------------------------
        // UPDATE REGISTERED SEAT COUNT
        // ----------------------------------------------------

        await Event.findByIdAndUpdate(
            event._id,
            {
                $inc: {
                    registeredSeats: 1
                }
            }
        );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                'Event registration successful.',

            registration

        });


    } catch (error) {

        console.error(
            'Register For Event Error:',
            error
        );


        // Duplicate key protection

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    'You have already registered for this event.'
            });

        }


        return res.status(500).json({

            success: false,

            message:
                'Unable to register for event.',

            error:
                error.message

        });

    }
};


// ============================================================
// STUDENT CONFIRM EXTERNAL REGISTRATION
// POST /api/registrations/external/:eventId
// ============================================================
//
// Student first registers on the external website.
// Then they come back to EventSphere and click:
// "I Registered Externally"
//
// No additional form is required.
// We use the logged-in student's account details.
// ============================================================

const confirmExternalRegistration = async (req, res) => {

    try {

        const {
            eventId
        } = req.params;


        // ----------------------------------------------------
        // CHECK EVENT ID
        // ----------------------------------------------------

        if (!eventId) {

            return res.status(400).json({

                success: false,

                message:
                    'Event ID is required.'

            });

        }


        // ----------------------------------------------------
        // FIND EVENT
        // ----------------------------------------------------

        const event =
            await Event.findById(eventId);


        if (!event) {

            return res.status(404).json({

                success: false,

                message:
                    'Event not found.'

            });

        }


        // ----------------------------------------------------
        // MAKE SURE EVENT USES EXTERNAL REGISTRATION
        // ----------------------------------------------------

        if (
            String(event.registrationType)
                .toLowerCase() !== 'external'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'This event does not use external registration.'

            });

        }


        // ----------------------------------------------------
        // FIND LOGGED-IN STUDENT
        // ----------------------------------------------------

        const student =
            await User.findById(req.user.id);


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    'Student account not found.'

            });

        }


        // ----------------------------------------------------
        // ROLE CHECK
        // ----------------------------------------------------

        if (
            student.role !== 'student'
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'Only students can confirm external registration.'

            });

        }


        // ----------------------------------------------------
        // CHECK DUPLICATE
        // ----------------------------------------------------

        const existingRegistration =
            await Registration.findOne({

                studentId:
                    student._id,

                eventId:
                    event._id

            });


        if (existingRegistration) {

            return res.status(409).json({

                success: false,

                message:
                    'You have already registered for this event.',

                registration:
                    existingRegistration

            });

        }


        // ----------------------------------------------------
        // GENERATE REGISTRATION ID
        // ----------------------------------------------------

        const registrationId =
            await generateRegistrationId(
                student.department
            );


        // ----------------------------------------------------
        // CREATE EXTERNAL REGISTRATION
        // ----------------------------------------------------

        const registration =
            await Registration.create({

                registrationId,

                studentId:
                    student._id,

                studentName:
                    student.name,

                studentEmail:
                    student.email,

                studentDept:
                    student.department,

                studentPhone:
                    student.phone,

                // These are not required for
                // external confirmation.
                rollNumber:
                    '',

                year:
                    '',

                eventId:
                    event._id,

                eventTitle:
                    event.title,

                // IMPORTANT
                registrationType:
                    'external',

                registeredAt:
                    new Date(),

                status:
                    'upcoming',

                attendance:
                    'absent'

            });


        // ----------------------------------------------------
        // UPDATE EVENT PARTICIPANT COUNT
        // ----------------------------------------------------

        await Event.findByIdAndUpdate(

            event._id,

            {
                $inc: {
                    registeredSeats: 1
                }
            }

        );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                'External registration confirmed successfully.',

            registration

        });


    } catch (error) {

        console.error(
            'Confirm External Registration Error:',
            error
        );


        // ----------------------------------------------------
        // DUPLICATE KEY PROTECTION
        // ----------------------------------------------------

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'You have already registered for this event.'

            });

        }


        return res.status(500).json({

            success: false,

            message:
                'Unable to confirm external registration.',

            error:
                error.message

        });

    }
};


// ============================================================
// GET MY REGISTRATIONS
// GET /api/registrations/my
// ============================================================

const getMyRegistrations = async (req, res) => {

    try {

        const registrations =
            await Registration
                .find({
                    studentId: req.user.id
                })

                .populate(
                    'eventId',
                    [
                        'title',
                        'department',
                        'venue',
                        'eventDate',
                        'eventTime',
                        'category',
                        'clubName',
                        'registrationType',
                        'maxSeats',
                        'unlimitedSeats',
                        'registeredSeats'
                    ]
                )

                .sort({
                    registeredAt: -1
                });


        // ----------------------------------------------------
        // FORMAT RESPONSE FOR ANGULARJS
        // ----------------------------------------------------

        const formattedRegistrations =
            registrations.map(
                function (registration) {

                    const event =
                        registration.eventId;


                    return {

                        _id:
                            registration._id,

                        registrationId:
                            registration.registrationId,


                        // ----------------------------------------
                        // STUDENT DETAILS
                        // ----------------------------------------

                        studentId:
                            registration.studentId,

                        studentName:
                            registration.studentName,

                        studentEmail:
                            registration.studentEmail,

                        studentDept:
                            registration.studentDept,

                        studentPhone:
                            registration.studentPhone,

                        rollNumber:
                            registration.rollNumber,

                        year:
                            registration.year,


                        // ----------------------------------------
                        // EVENT DETAILS
                        // ----------------------------------------

                        eventId:
                            event
                                ? event._id
                                : registration.eventId,

                        eventTitle:
                            event
                                ? event.title
                                : registration.eventTitle,

                        department:
                            event
                                ? event.department
                                : '',

                        venue:
                            event
                                ? event.venue
                                : '',

                        eventDate:
                            event
                                ? event.eventDate
                                : null,

                        eventTime:
                            event
                                ? event.eventTime
                                : null,

                        category:
                            event
                                ? event.category
                                : '',

                        clubName:
                            event
                                ? event.clubName
                                : '',


                        // ----------------------------------------
                        // IMPORTANT:
                        // USE REGISTRATION TYPE FROM REGISTRATION
                        // ----------------------------------------

                        registrationType:
                            registration.registrationType ||
                            'internal',


                        maxSeats:
                            event
                                ? event.maxSeats
                                : null,

                        unlimitedSeats:
                            event
                                ? event.unlimitedSeats
                                : false,

                        registeredSeats:
                            event
                                ? event.registeredSeats
                                : 0,


                        // ----------------------------------------
                        // REGISTRATION DETAILS
                        // ----------------------------------------

                        registeredAt:
                            registration.registeredAt,

                        status:
                            registration.status,

                        attendance:
                            registration.attendance,

                        createdAt:
                            registration.createdAt,

                        updatedAt:
                            registration.updatedAt

                    };

                }
            );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            count:
                formattedRegistrations.length,

            registrations:
                formattedRegistrations

        });


    } catch (error) {

        console.error(
            'Get My Registrations Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to load registrations.',

            error:
                error.message

        });

    }
};


// ============================================================
// GET PARTICIPANTS FOR AN EVENT
// GET /api/registrations/event/:eventId
// ============================================================

const getEventParticipants = async (req, res) => {

    try {

        const {
            eventId
        } = req.params;


        // ----------------------------------------------------
        // FIND EVENT
        // ----------------------------------------------------

        const event =
            await Event.findById(eventId);


        if (!event) {

            return res.status(404).json({

                success: false,

                message:
                    'Event not found.'

            });

        }


        // ----------------------------------------------------
        // COORDINATOR OWNERSHIP CHECK
        // ----------------------------------------------------

        if (
            String(event.createdBy) !==
            String(req.user.id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'You can only view participants of your own events.'

            });

        }


        // ----------------------------------------------------
        // GET REGISTRATIONS
        // ----------------------------------------------------

        const participants =
            await Registration
                .find({
                    eventId: event._id
                })
                .sort({
                    registeredAt: -1
                });


        return res.status(200).json({

            success: true,

            event: {

                id:
                    event._id,

                title:
                    event.title,

                maxSeats:
                    event.maxSeats,

                unlimitedSeats:
                    event.unlimitedSeats,

                registeredSeats:
                    event.registeredSeats

            },

            count:
                participants.length,

            participants

        });


    } catch (error) {

        console.error(
            'Get Event Participants Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to load event participants.',

            error:
                error.message

        });

    }
};


// ============================================================
// UPDATE ATTENDANCE
// PATCH /api/registrations/:id/attendance
// ============================================================

const updateAttendance = async (req, res) => {

    try {

        const {
            attendance
        } = req.body;


        // ----------------------------------------------------
        // VALIDATE ATTENDANCE
        // ----------------------------------------------------

        if (
            !attendance ||
            ![
                'present',
                'absent'
            ].includes(
                attendance.toLowerCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Attendance must be present or absent.'

            });

        }


        // ----------------------------------------------------
        // FIND REGISTRATION
        // ----------------------------------------------------

        const registration =
            await Registration.findById(
                req.params.id
            );


        if (!registration) {

            return res.status(404).json({

                success: false,

                message:
                    'Registration not found.'

            });

        }


        // ----------------------------------------------------
        // FIND EVENT
        // ----------------------------------------------------

        const event =
            await Event.findById(
                registration.eventId
            );


        if (!event) {

            return res.status(404).json({

                success: false,

                message:
                    'Associated event not found.'

            });

        }


        // ----------------------------------------------------
        // CHECK COORDINATOR OWNERSHIP
        // ----------------------------------------------------

        if (
            String(event.createdBy) !==
            String(req.user.id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'You can only update attendance for your own events.'

            });

        }


        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        const newAttendance =
            attendance.toLowerCase();


        registration.attendance =
            newAttendance;


        if (
            newAttendance === 'present'
        ) {

            registration.status =
                'attended';

        } else {

            registration.status =
                'upcoming';

        }


        await registration.save();


        return res.status(200).json({

            success: true,

            message:
                'Attendance updated successfully.',

            registration

        });


    } catch (error) {

        console.error(
            'Update Attendance Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to update attendance.',

            error:
                error.message

        });

    }

};


// ============================================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:id
// ============================================================

const cancelRegistration = async (req, res) => {

    try {

        const registration =
            await Registration.findById(
                req.params.id
            );


        if (!registration) {

            return res.status(404).json({

                success: false,

                message:
                    'Registration not found.'

            });

        }


        // ----------------------------------------------------
        // STUDENT CAN CANCEL ONLY OWN REGISTRATION
        // ----------------------------------------------------

        if (
            String(registration.studentId) !==
            String(req.user.id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'You can only cancel your own registration.'

            });

        }


        // ----------------------------------------------------
        // FIND EVENT
        // ----------------------------------------------------

        const event =
            await Event.findById(
                registration.eventId
            );


        // ----------------------------------------------------
        // DELETE REGISTRATION
        // ----------------------------------------------------

        await Registration.findByIdAndDelete(
            registration._id
        );


        // ----------------------------------------------------
        // REDUCE REGISTERED SEAT COUNT
        // ----------------------------------------------------

        if (event) {

            await Event.findByIdAndUpdate(
                event._id,
                {
                    $inc: {
                        registeredSeats: -1
                    }
                }
            );

        }


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                'Registration cancelled successfully.'

        });


    } catch (error) {

        console.error(
            'Cancel Registration Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to cancel registration.',

            error:
                error.message

        });

    }

};


// ============================================================
// HELPER — COMBINE DATE + TIME
// ============================================================

function combineDateAndTime(
    dateValue,
    timeValue
) {

    if (!dateValue) {
        return null;
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return null;
    }


    // --------------------------------------------------------
    // IF TIME IS NOT PROVIDED
    // --------------------------------------------------------

    if (!timeValue) {
        return date;
    }


    const time =
        new Date(timeValue);


    if (isNaN(time.getTime())) {
        return date;
    }


    date.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        0
    );


    return date;
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    registerForEvent,

    confirmExternalRegistration,

    getMyRegistrations,

    getEventParticipants,

    updateAttendance,

    cancelRegistration

};