import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocument schema for HR details
const hrSchema = new Schema({
    hr_name: {
        type: String,
        trim: true,
        required: true
    },
    hr_email: {
        type: String,
        trim: true,
        required: true
    },
    hr_phoneNo: {
        type: String,
        trim: true,
        required: true
    }
});

// Subdocument schema for Company details
const companySchema = new Schema({
    company_name: {
        type: String,
        trim: true,
        required: true
    },
    company_location: {
        type: String,
        trim: true,
        required: true
    }
});

// Subdocument schema for Student details
const studentSchema = new Schema({
    student_id: {
        type: String,
        trim: true,
        required: true
    },
    student_name: {
        type: String,
        trim: true,
        required: true
    },
    student_sem: {
        type: Number,
        required: true
    },
    student_email: {
        type: String,
        trim: true,
        required: true
    },
    student_phoneNo: {
        type: String,
        trim: true,
        required: true
    }
});

// Subdocument schema for College details
const collegeSchema = new Schema({
    college_name: {
        type: String,
        trim: true,
        required: true
    },
    college_branch: {
        type: String,
        trim: true,
        required: true
    }
});

const certificateSchema = new Schema(
    {
        student: {
            type: studentSchema,
            required: true
        },
        hr: {
            type: hrSchema,
            required: true
        },
        company: {
            type: companySchema,
            required: true
        },
        college: {
            type: collegeSchema,
            required: true
        },
        certificate_status: {
            type: Boolean,
            required: true
        },
        internship_starting_date: {
            type: Date,
            required: true
        },
        internship_ending_date: {
            type: Date,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export const Certificate = model('Certificate', certificateSchema);
