const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const protect =
    require('../middleware/authMiddleware');

const {
    authorizeRoles
} =
    require('../middleware/roleMiddleware');

const {
    uploadOD,
    getOD,
    downloadOD,
    getMyODDocuments
} =
    require('../controllers/odController');


const router =
    express.Router();


/*
=========================================================
UPLOAD DIRECTORY
=========================================================
*/

const uploadDir =
    path.join(
        __dirname,
        '..',
        'uploads',
        'od-pdfs'
    );


fs.mkdirSync(
    uploadDir,
    {
        recursive: true
    }
);


/*
=========================================================
MULTER STORAGE
=========================================================
*/

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDir
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const originalName =
                    path.basename(
                        file.originalname,
                        path.extname(
                            file.originalname
                        )
                    );


                const safeName =
                    originalName
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            '_'
                        );


                const filename =
                    Date.now() +
                    '-' +
                    safeName +
                    '.pdf';


                cb(
                    null,
                    filename
                );

            }

    });


/*
=========================================================
MULTER CONFIGURATION
=========================================================
*/

const upload =
    multer({

        storage: storage,

        limits: {

            fileSize:
                10 * 1024 * 1024

        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const isPDF =
                    file.mimetype ===
                    'application/pdf';


                if (!isPDF) {

                    return cb(
                        new Error(
                            'Only PDF files are allowed.'
                        )
                    );

                }


                cb(
                    null,
                    true
                );

            }

    });


/*
=========================================================
GET MY OD
Student
=========================================================
*/

router.get(
    '/my',
    protect,
    authorizeRoles('student'),
    getMyODDocuments
);


/*
=========================================================
UPLOAD OD
Coordinator
=========================================================
*/

router.post(
    '/:eventId/upload',
    protect,
    authorizeRoles('coordinator'),
    upload.single('odPdf'),
    uploadOD
);


/*
=========================================================
DOWNLOAD / VIEW OD
Student + Coordinator
=========================================================
*/

router.get(
    '/:eventId/download',
    protect,
    downloadOD
);


/*
=========================================================
GET EVENT OD
Coordinator
=========================================================
*/

router.get(
    '/:eventId',
    protect,
    authorizeRoles('coordinator'),
    getOD
);


module.exports =
    router;