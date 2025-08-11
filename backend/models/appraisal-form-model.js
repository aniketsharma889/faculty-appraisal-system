const mongoose = require('mongoose');

const AppraisalFormSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // === Personal Information ===
    fullName: { type: String, required: true },
    employeeCode: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    department: { type: String, required: true },
    designation: { type: String },           // e.g., Assistant Professor
    dateOfJoining: { type: Date },
    dateOfBirth: { type: Date },
    address: { type: String },

    // === Professional Information ===
    academicQualifications: [
        {
            degree: String,
            institution: String,
            yearOfPassing: Number
        }
    ],
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
    awardsRecognitions: [
        {
            title: String,
            year: Number,
            organization: String
        }
    ],
    professionalMemberships: [String],  // e.g., ['IEEE', 'ACM']
    coursesTaught: [
        {
            courseName: String,
            semester: String
        }
    ],
    administrativeResponsibilities: [
        {
            role: String,
            duration: String
        }
    ],
    studentMentoring: [
        {
            studentName: String,
            year: Number,
            projectTitle: String
        }
    ],

    // === Uploaded Files Metadata ===
    uploadedFiles: [
        {
            fileName: String,
            fileUrl: String,  // e.g., "/uploads/123456-filename.pdf"
            uploadedAt: { type: Date, default: Date.now }
        }
    ],

    submissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending_hod', 'pending_admin', 'approved', 'rejected'],
        default: 'pending_hod'
    },
    hodApproval: {
        approved: { type: Boolean, default: null },  // null = not reviewed yet
        date: Date,
        remarks: String
    },
    adminApproval: {
        approved: { type: Boolean, default: null },
        date: Date,
        remarks: String
    },

}, { timestamps: true });

module.exports = mongoose.model('AppraisalForm', AppraisalFormSchema);
