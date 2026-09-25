const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');


// =========================================================
// HELPER: COMBINE DATE AND TIME
// =========================================================

const combineDateAndTime = (date, time) => {

    if (!date || !time) {
        return null;
    }

    const datePart = new Date(date);
    const timePart = new Date(time);

    if (
        isNaN(datePart.getTime()) ||
        isNaN(timePart.getTime())
    ) {
        return null;
    }

    const combined = new Date(datePart);

    combined.setHours(
        timePart.getHours(),
        timePart.getMinutes(),
        timePart.getSeconds(),
        0
    );

    return combined;
};


// =========================================================
// HELPER: GENERATE REGISTRATION ID
// =========================================================

const generateRegistrationId = (department) => {

    let deptCode = 'GEN';

    if (department) {

        const cleaned =
            department
                .replace(/[^a-zA-Z]/g, '')
                .toUpperCase();

        if (cleaned.length >= 2) {
            deptCode = cleaned.substring(0, 3);
        }
    }

    const randomNumber =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `TCE2026${deptCode}${randomNumber}`;
};


// =========================================================
// STUDENT: REGISTER FOR EVENT
// =========================================================

const registerForEvent = async (req, res) => {

    try {

        const {
            eventId,
            rollNumber,
            year
        } = req.body;


        // -------------------------------------------------
        // VALIDATE EVENT ID
        // -------------------------------------------------

        if (!eventId) {

            return res.status(400).json({

                success: false,

                message: 'Event ID is required.'

            });
        }


        // -------------------------------------------------
        // FIND EVENT
        // -------------------------------------------------

        const event =
            await Event.findById(eventId);


        if (!event) {

            return res.status(404).json({

                success: false,

                message: 'Event not found.'

            });
        }


        // -------------------------------------------------
        // EXTERNAL REGISTRATION
        // -------------------------------------------------

        if (
            String(event.registrationType)
                .toLowerCase() === 'external'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'This event uses external registration.'

            });
        }


        // -------------------------------------------------
        // FIND STUDENT
        // -------------------------------------------------

        const student =
            await User.findById(req.user.id);


        if (!student) {

            return res.status(404).json({

                success: false,

                message: 'Student account not found.'

            });
        }


        // -------------------------------------------------
        // CHECK DUPLICATE REGISTRATION
        // -------------------------------------------------

        const existingRegistration =
            await Registration.findOne({

                studentId: student._id,

                eventId: event._id

            });


        if (existingRegistration) {

            return res.status(409).json({

                success: false,

                message:
                    'You are already registered for this event.',

                registration:
                    existingRegistration

            });
        }


        // -------------------------------------------------
        // CHECK SEAT AVAILABILITY
        // -------------------------------------------------

        if (!event.unlimitedSeats) {

            const maxSeats =
                Number(event.maxSeats || 0);

            const registeredSeats =
                Number(event.registeredSeats || 0);


            if (
                maxSeats > 0 &&
                registeredSeats >= maxSeats
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Sorry, this event is already full.'

                });
            }
        }


        // -------------------------------------------------
        // CHECK REGISTRATION PERIOD
        // -------------------------------------------------

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

        const now = new Date();


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
                    'Registration for this event has ended.'

            });
        }


        // -------------------------------------------------
        // GENERATE REGISTRATION ID
        // -------------------------------------------------

        let registrationId;

        let registrationExists = true;


        while (registrationExists) {

            registrationId =
                generateRegistrationId(
                    student.department
                );

            registrationExists =
                await Registration.findOne({
                    registrationId
                });
        }


        // -------------------------------------------------
        // CREATE REGISTRATION
        // -------------------------------------------------

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

                registeredAt:
                    new Date(),

                status:
                    'upcoming',

                attendance:
                    'absent'

            });


        // -------------------------------------------------
        // INCREMENT REGISTERED SEATS
        // -------------------------------------------------

        if (!event.unlimitedSeats) {

            event.registeredSeats =
                Number(event.registeredSeats || 0) + 1;

            await event.save();
        }


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                'Registration successful.',

            registration

        });

    } catch (error) {

        console.error(
            'Register For Event Error:',
            error
        );


        // Handle duplicate MongoDB index error
        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    'You are already registered for this event.'

            });
        }


        return res.status(500).json({

            success: false,

            message:
                'Unable to register for the event.'

        });
    }
};


// =========================================================
// STUDENT: GET MY REGISTRATIONS
// =========================================================

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


        // -------------------------------------------------
        // FORMAT RESPONSE
        // -------------------------------------------------

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


                        // EVENT DETAILS

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

                        registrationType:
                            event
                                ? event.registrationType
                                : '',

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


                        // REGISTRATION DETAILS

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
                'Unable to fetch your registrations.'

        });
    }
};


// =========================================================
// COORDINATOR: GET EVENT PARTICIPANTS
// =========================================================

const getEventParticipants = async (req, res) => {

    try {

        const { eventId } = req.params;


        // -------------------------------------------------
        // FIND EVENT
        // -------------------------------------------------

        const event =
            await Event.findById(eventId);


        if (!event) {

            return res.status(404).json({

                success: false,

                message: 'Event not found.'

            });
        }


        // -------------------------------------------------
        // CHECK EVENT CREATOR
        // -------------------------------------------------

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


        // -------------------------------------------------
        // GET REGISTRATIONS
        // -------------------------------------------------

        const registrations =
            await Registration
                .find({
                    eventId: eventId
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

                department:
                    event.department,

                venue:
                    event.venue,

                eventDate:
                    event.eventDate,

                eventTime:
                    event.eventTime,

                registeredSeats:
                    event.registeredSeats,

                maxSeats:
                    event.maxSeats,

                unlimitedSeats:
                    event.unlimitedSeats

            },

            count:
                registrations.length,

            participants:
                registrations

        });

    } catch (error) {

        console.error(
            'Get Event Participants Error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to fetch event participants.'

        });
    }
};


// =========================================================
// COORDINATOR: UPDATE ATTENDANCE
// =========================================================

const updateAttendance = async (req, res) => {

    try {

        const { id } = req.params;

        const { attendance } =
            req.body;


        // -------------------------------------------------
        // VALIDATE ATTENDANCE
        // -------------------------------------------------

        if (
            !['present', 'absent']
                .includes(
                    String(attendance).toLowerCase()
                )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Attendance must be either present or absent.'

            });
        }


        // -------------------------------------------------
        // FIND REGISTRATION
        // -------------------------------------------------

        const registration =
            await Registration
                .findById(id);


        if (!registration) {

            return res.status(404).json({

                success: false,

                message:
                    'Registration not found.'

            });
        }


        // -------------------------------------------------
        // FIND EVENT
        // -------------------------------------------------

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


        // -------------------------------------------------
        // CHECK EVENT CREATOR
        // -------------------------------------------------

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


        // -------------------------------------------------
        // UPDATE ATTENDANCE
        // -------------------------------------------------

        registration.attendance =
            String(attendance).toLowerCase();


        if (
            registration.attendance ===
            'present'
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
                'Unable to update attendance.'

        });
    }
};


// =========================================================
// STUDENT: CANCEL REGISTRATION
// =========================================================

const cancelRegistration = async (req, res) => {

    try {

        const { id } = req.params;


        // -------------------------------------------------
        // FIND REGISTRATION
        // -------------------------------------------------

        const registration =
            await Registration
                .findById(id);


        if (!registration) {

            return res.status(404).json({

                success: false,

                message:
                    'Registration not found.'

            });
        }


        // -------------------------------------------------
        // CHECK OWNER
        // -------------------------------------------------

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


        // -------------------------------------------------
        // CHECK STATUS
        // -------------------------------------------------

        if (
            registration.status !==
            'upcoming'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Only upcoming registrations can be cancelled.'

            });
        }


        // -------------------------------------------------
        // FIND EVENT
        // -------------------------------------------------

        const event =
            await Event.findById(
                registration.eventId
            );


        // -------------------------------------------------
        // DELETE REGISTRATION
        // -------------------------------------------------

        await Registration.findByIdAndDelete(
            id
        );


        // -------------------------------------------------
        // DECREASE REGISTERED SEATS
        // -------------------------------------------------

        if (
            event &&
            !event.unlimitedSeats
        ) {

            event.registeredSeats =
                Math.max(
                    Number(
                        event.registeredSeats || 0
                    ) - 1,
                    0
                );

            await event.save();
        }


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
                'Unable to cancel registration.'

        });
    }
};


// =========================================================
// EXPORT CONTROLLERS
// =========================================================

module.exports = {

    registerForEvent,

    getMyRegistrations,

    getEventParticipants,

    updateAttendance,

    cancelRegistration

};