const mongoose = require('mongoose');

const odDocumentSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            unique: true
        },

        eventTitle: {
            type: String,
            required: true,
            trim: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        fileName: {
            type: String,
            required: true,
            trim: true
        },

        filePath: {
            type: String,
            required: true,
            trim: true
        },

        uploadedAt: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ['signed'],
            default: 'signed'
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model('ODDocument', odDocumentSchema);