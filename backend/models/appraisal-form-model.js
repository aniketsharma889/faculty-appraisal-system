// models/AppraisalForm.js
const mongoose = require('mongoose');

const AppraisalFormSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    researchPublications: [
        {
            title: String,
            journal: String,
            year: Number
        }
    ],
    seminars: [
        {
            title: String,
            date: Date,
            venue: String
        }
    ],
    projects: [
        {
            title: String,
            description: String,
            year: Number
        }
    ],
    lectures: [
        {
            topic: String,
            date: Date
        }
    ],
    submissionDate: {
        type: Date, default: Date.now
    },
    status: {
        type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'
    },
    adminComments: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AppraisalForm', AppraisalFormSchema);
