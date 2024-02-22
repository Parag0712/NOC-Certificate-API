import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocument schema for HR details
const hrSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    phoneNo: {
        type: String,
        trim: true,
        required: true
    }
});

// Subdocument schema for Company details
const companySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    location: {
        type: String,
        trim: true,
        required: true
    }
});

const certificateSchema = new Schema(
    {
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
            trim: true,
            required: true
        },
        student_email: {
            type: String,
            trim: true,
            required: true
        },
        student_phoneNo: {
            type: Number,
            trim: true,
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
        college_name: {
            type: String,
            trim: true,
            required: true
        },
        college_branch: {
            type: String,
            trim: true,
            required: true
        },
        certificate_status: {
            type: Boolean,
            required: true,
            trim: true
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
