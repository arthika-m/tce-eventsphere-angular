const fs = require('fs');
const path = require('path');

const ODDocument = require('../models/ODDocument');
const Event = require('../models/Event');
const Registration = require('../models/Registration');


// ============================================================
// UPLOAD SIGNED OD PDF
// POST /api/od/:eventId/upload
// ============================================================

const uploadOD = async (req, res) => {

    try {

        const { eventId } = req.params;


        // ----------------------------------------------------
        // CHECK FILE
        // ----------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: 'Please upload a signed OD PDF.'
            });

        }


        // ----------------------------------------------------
        // CHECK EVENT
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
        // CHECK COORDINATOR OWNERSHIP
        // ----------------------------------------------------

        if (
            String(event.createdBy) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    'You can only upload OD for your own events.'
            });

        }


        // ----------------------------------------------------
        // CHECK WHETHER OD ALREADY EXISTS
        // ----------------------------------------------------

        const existingOD =
            await ODDocument.findOne({
                eventId: event._id
            });


        // ----------------------------------------------------
        // IF RE-UPLOADING, REMOVE OLD FILE
        // ----------------------------------------------------

        if (existingOD) {

            const oldFilePath =
                path.join(
                    __dirname,
                    '..',
                    existingOD.filePath
                );

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

        }


        // ----------------------------------------------------
        // CREATE / UPDATE OD DOCUMENT
        // ----------------------------------------------------

        let odDocument;

        if (existingOD) {

            existingOD.fileName =
                req.file.filename;

            existingOD.filePath =
                path.join(
                    'uploads',
                    'od-pdfs',
                    req.file.filename
                );

            existingOD.uploadedBy =
                req.user.id;

            existingOD.uploadedAt =
                new Date();

            existingOD.status =
                'signed';

            odDocument =
                await existingOD.save();

        } else {

            odDocument =
                await ODDocument.create({

                    eventId:
                        event._id,

                    eventTitle:
                        event.title,

                    uploadedBy:
                        req.user.id,

                    fileName:
                        req.file.filename,

                    filePath:
                        path.join(
                            'uploads',
                            'od-pdfs',
                            req.file.filename
                        ),

                    uploadedAt:
                        new Date(),

                    status:
                        'signed'

                });

        }


        return res.status(201).json({

            success: true,

            message:
                'Signed OD PDF uploaded successfully.',

            od: odDocument

        });

    } catch (error) {

        console.error(
            'Upload OD Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Unable to upload OD document.',

            error:
                error.message

        });

    }

};


// ============================================================
// GET OD INFORMATION
// GET /api/od/:eventId
// ============================================================

const getOD = async (req, res) => {

    try {

        const { eventId } = req.params;


        const od =
            await ODDocument.findOne({
                eventId
            });


        if (!od) {

            return res.status(404).json({

                success: false,

                message:
                    'OD document has not been uploaded yet.'

            });

        }


        return res.status(200).json({

            success: true,

            od

        });

    } catch (error) {

        console.error(
            'Get OD Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Unable to load OD document.'

        });

    }

};


// ============================================================
// DOWNLOAD OD — STUDENT
// GET /api/od/:eventId/download
// ============================================================

const downloadOD = async (req, res) => {

    try {

        const { eventId } = req.params;


        // ----------------------------------------------------
        // FIND STUDENT REGISTRATION
        // ----------------------------------------------------

        const registration =
            await Registration.findOne({

                eventId,

                studentId:
                    req.user.id

            });


        if (!registration) {

            return res.status(403).json({

                success: false,

                message:
                    'You are not registered for this event.'

            });

        }


        // ----------------------------------------------------
        // ATTENDANCE CHECK
        // ----------------------------------------------------

        if (
            registration.attendance !==
            'present'
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'OD is available only for students who attended the event.'

            });

        }


        // ----------------------------------------------------
        // FIND OD
        // ----------------------------------------------------

        const od =
            await ODDocument.findOne({
                eventId
            });


        if (!od) {

            return res.status(404).json({

                success: false,

                message:
                    'Signed OD document is not available yet.'

            });

        }


        // ----------------------------------------------------
        // FILE PATH
        // ----------------------------------------------------

        const filePath =
            path.join(
                __dirname,
                '..',
                od.filePath
            );


        if (!fs.existsSync(filePath)) {

            return res.status(404).json({

                success: false,

                message:
                    'OD file could not be found.'

            });

        }


        // ----------------------------------------------------
        // SEND PDF
        // ----------------------------------------------------

        return res.download(
            filePath,
            od.fileName
        );

    } catch (error) {

        console.error(
            'Download OD Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Unable to download OD document.'

        });

    }

};


// ============================================================
// GET MY OD DOCUMENTS
// GET /api/od/my
// ============================================================

const getMyODDocuments = async (req, res) => {

    try {

        const registrations =
            await Registration.find({

                studentId:
                    req.user.id,

                attendance:
                    'present'

            });


        const eventIds =
            registrations.map(
                registration =>
                    registration.eventId
            );


        const odDocuments =
            await ODDocument.find({

                eventId: {
                    $in: eventIds
                }

            }).sort({

                uploadedAt: -1

            });


        return res.status(200).json({

            success: true,

            count:
                odDocuments.length,

            odDocuments

        });

    } catch (error) {

        console.error(
            'Get My OD Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Unable to load OD documents.'

        });

    }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    uploadOD,

    getOD,

    downloadOD,

    getMyODDocuments

};