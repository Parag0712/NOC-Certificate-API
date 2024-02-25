import { Certificate } from "../model/certificate.model.js";
import { User } from "../model/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// Add Certificate Request
export const registerCertificateReq = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;
    console.log(loggedInUserId);
    const {
        student_id,
        student_name,
        student_sem,
        student_email,
        student_phoneNo,
        college_name,
        college_branch,
        company_name,
        company_location,
        hr_name,
        hr_email,
        hr_phoneNo,
        certificate_status,
        internship_starting_date,
        internship_ending_date,
    } = req.body;

    // Define validation function
    const validateField = (field) => {
        if (!req.body[field]) {
            res.status(400).json({ message: `${field} is required.` });
            return false;
        }
        return true;
    };

    // Validate all required fields
    const isValid = [
        "student_id",
        "student_name",
        "student_sem",
        "student_email",
        "student_phoneNo",
        "college_name",
        "college_branch",
        "company_name",
        "company_location",
        "hr_name",
        "hr_email",
        "hr_phoneNo",
        "certificate_status",
        "internship_starting_date",
        "internship_ending_date",
    ].every(validateField);

    if (!isValid) {
        return;
    }
    const existingUser = await Certificate.findOne(
        {
            $or: [
                { 'student.student_id': student_id },
                { 'student.student_email': student_email }
            ],
            certificate_status: true
        }
    );
    if (existingUser) {
        return res.status(409).json({
            message: "You cannot Resubmit Form"
        })
    }

    // newCertificate
    const newCertificate = await Certificate.create({
        student: {
            student_id,
            student_name,
            student_sem,
            student_email,
            student_phoneNo
        },
        college: {
            college_name,
            college_branch
        },
        company: {
            company_name,
            company_location
        },
        hr: {
            hr_name,
            hr_email,
            hr_phoneNo
        },
        user: loggedInUserId,
        certificate_status,
        internship_starting_date,
        internship_ending_date
    });


    const user = await User.findById(loggedInUserId);

    user.certificateIssue.push(newCertificate._id);
    await user.save();

    if (!user) {
        return res.status(500).json(
            { message: "Something went wrong while registering the user" }
        )
    }

    return res
        .status(201)
        .json(new ApiResponse(201, {
            certificate: newCertificate,
        }, "Certificate Request Successfully"));
});


// Admin update Status approve and reject 
export const updateStateCertificate = asyncHandler(async (req, res) => {
    const certificateId = req.params.id;

    const loggedInUserId = req.user._id;
    const { certificate_status } = req.body;


    if (!certificate_status || certificate_status.trim() === "") {
        return res.status(400).json({ message: `certificate_status is required` });
    }

    // Check if the certificate exists
    const existingCertificate = await Certificate.findById(certificateId);
    if (!existingCertificate) {
        return res.status(404).json({ message: "Certificate not found" });
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
        certificateId,
        {
            $set: {
                certificate_status,
                adminAssociate: loggedInUserId
            },
        },
        { new: true }
    )


    if (!updatedCertificate) {
        return res.status(500).json(
            { message: "Something went wrong while update the certificate" }
        )
    }

    return res
        .status(201)
        .json(new ApiResponse(201, {
            certificate: updatedCertificate,
        }, "Certificate updated Successfully"));
})

// Delete Certificate Request

export const deleteCertificateRequest = asyncHandler(async (req, res) => {
    const certificateId = req.params.id;

    // Check if the certificate exists
    const existingCertificate = await Certificate.findById(certificateId);
    if (!existingCertificate) {
        return res.status(404).json({ message: "Certificate not found" });
    }

    // Delete the certificate
    await Certificate.findByIdAndDelete(certificateId);

    // Optionally, perform additional actions after deletion (e.g., updating related data)


    return res
        .status(201)
        .json(new ApiResponse(201, {
            certificate: '',
        }, "Certificate deleted Successfully"));
});