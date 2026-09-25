const path = require('path');

const dotenv = require('dotenv');

dotenv.config({
    path: path.join(
        __dirname,
        '../../.env'
    )
});


const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');

const connectDB =
    require('../config/db');

const User =
    require('../models/User');


// ======================================================
// DEMO USERS
// ======================================================

const seedUsers = async () => {

    try {

        // ----------------------------------------------
        // Connect MongoDB
        // ----------------------------------------------

        await connectDB();


        // ----------------------------------------------
        // Student password
        // ----------------------------------------------

        const studentPassword =
            await bcrypt.hash(
                'Student@123',
                10
            );


        // ----------------------------------------------
        // Coordinator password
        // ----------------------------------------------

        const coordinatorPassword =
            await bcrypt.hash(
                'Coordinator@123',
                10
            );


        // ----------------------------------------------
        // Student
        // ----------------------------------------------

        await User.findOneAndUpdate(

            {
                email:
                    'student.demo@tce.edu'
            },

            {
                name:
                    'Demo Student',

                email:
                    'student.demo@tce.edu',

                department:
                    'Information Technology',

                phone:
                    '9876543210',

                role:
                    'student',

                passwordHash:
                    studentPassword

            },

            {
                upsert: true,

                new: true,

                setDefaultsOnInsert: true
            }

        );


        // ----------------------------------------------
        // Coordinator
        // ----------------------------------------------

        await User.findOneAndUpdate(

            {
                email:
                    'it.coordinator@tce.edu'
            },

            {
                name:
                    'IT Coordinator',

                email:
                    'it.coordinator@tce.edu',

                department:
                    'Information Technology',

                phone:
                    '9876543211',

                role:
                    'coordinator',

                passwordHash:
                    coordinatorPassword

            },

            {
                upsert: true,

                new: true,

                setDefaultsOnInsert: true
            }

        );


        console.log('');
        console.log(
            '=========================================='
        );
        console.log(
            'TCE EventSphere Demo Users Created'
        );
        console.log(
            '=========================================='
        );

        console.log('');
        console.log(
            'STUDENT'
        );

        console.log(
            'Email: student.demo@tce.edu'
        );

        console.log(
            'Password: Student@123'
        );

        console.log('');

        console.log(
            'COORDINATOR'
        );

        console.log(
            'Email: it.coordinator@tce.edu'
        );

        console.log(
            'Password: Coordinator@123'
        );

        console.log('');

        console.log(
            '=========================================='
        );


    } catch (error) {

        console.error(
            'Seed Error:',
            error
        );

    } finally {

        await mongoose.connection.close();

        process.exit(0);

    }
};


// ======================================================
// RUN
// ======================================================

seedUsers();