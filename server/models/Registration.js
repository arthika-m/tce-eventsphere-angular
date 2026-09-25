const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        registrationId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // Student reference
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        studentName: {
            type: String,
            required: true,
            trim: true
        },

        studentEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        studentDept: {
            type: String,
            required: true,
            trim: true
        },

        studentPhone: {
            type: String,
            required: true,
            trim: true
        },

        rollNumber: {
            type: String,
            default: '',
            trim: true
        },

        year: {
            type: String,
            default: '',
            trim: true
        },

        // Event reference
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },

        eventTitle: {
            type: String,
            required: true,
            trim: true
        },

        // Registration type
        // internal = registered directly through EventSphere
        // external = registered through the external event link
        registrationType: {
            type: String,
            enum: [
                'internal',
                'external'
            ],
            default: 'internal'
        },

        registeredAt: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: [
                'upcoming',
                'attended',
                'cancelled'
            ],
            default: 'upcoming'
        },

        attendance: {
            type: String,
            enum: [
                'absent',
                'present'
            ],
            default: 'absent'
        }
    },
    {
        timestamps: true
    }
);


// Prevent the same student from registering
// for the same event more than once.
registrationSchema.index(
    {
        studentId: 1,
        eventId: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model(
        'Registration',
        registrationSchema
    );