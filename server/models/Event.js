const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                'Technical',
                'Workshop',
                'Seminar',
                'Sports',
                'Cultural',
                'Placement',
                'NSS',
                'NCC',
                'YRC'
            ]
        },

        clubName: {
            type: String,
            required: true,
            trim: true
        },

        venue: {
            type: String,
            required: true,
            trim: true
        },

        eventDate: {
            type: String,
            required: true
        },

        eventTime: {
            type: String,
            required: true
        },

        regStartDate: {
            type: String,
            required: true
        },

        regStartTime: {
            type: String,
            required: true
        },

        regEndDate: {
            type: String,
            required: true
        },

        regEndTime: {
            type: String,
            required: true
        },

        maxSeats: {
            type: Number,
            default: 0
        },

        unlimitedSeats: {
            type: Boolean,
            default: false
        },

        registrationType: {
            type: String,
            enum: ['BuiltIn', 'External'],
            default: 'BuiltIn'
        },

        registrationLink: {
            type: String,
            default: ''
        },

        posterURL: {
            type: String,
            default: ''
        },

        posterType: {
            type: String,
            enum: ['image', 'pdf', 'none'],
            default: 'none'
        },

        visibility: {
            type: String,
            enum: ['DepartmentOnly', 'CollegeWide'],
            default: 'DepartmentOnly'
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        registeredSeats: {
            type: Number,
            default: 0
        },

        odPdfURL: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Event', eventSchema);