import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import fs from 'fs';
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";

// GenerateAccess Token Refresh Token
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, error + "Something went wrong while generating access and refresh token 1");
    }
}

// Validate Field
function validateField(value, fieldName, res) {
    if (!value || value.trim() === "") {
        return res.status(400).json({ message: `${fieldName} is required` });
    }

    if (fieldName === "password" && value.length < 6) {
        return res.status(400).json({ message: `${fieldName} must be at least 6 characters` });
    }
}
function validateFile(avatarLocalPath, mb) {
    const avatarStats = fs.statSync(avatarLocalPath);
    const fileSizeInBytes = avatarStats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    const maxFileSizeInMegabytes = mb;
    if (fileSizeInMegabytes > maxFileSizeInMegabytes) {
        return res.status(400).json(`Avatar file exceeds the maximum size of ${mb}MB`)
    }
}



//Register Function 
export const register = asyncHandler(async (req, res) => {
    const { email, password, isAdmin, firstName, lastName } = req.body;

    validateField(email, "email", res);
    validateField(firstName, "firstName", res);
    validateField(lastName, "lastName", res);
    validateField(password, "password", res);


    const existedUser = await User.findOne({ email: email });

    if (existedUser) {
        return res.status(409).json({
            message: "User with email already exists"
        })
    }

    const user = await User.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        isAdmin: isAdmin || false,
    });
    user.password = undefined;
    user.refreshToken = undefined;


    if (!user) {
        return res.status(500).json(
            { message: "Something went wrong while registering the user" }
        )
    }


    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    //store in cookie 
    const options = {
        httpOnly: true,
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, {
            user: user,
            tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }, "User Register Successfully"));
});

// Login Function
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    validateField(email, "email", res);
    validateField(password, "password", res);

    const user = await User.findOne({ email: email });

    // if not exist in database then send error
    if (!user) { return res.status(404).json({ message: "User does Not Exist" }) }

    const isPasswordValid = await user.isPasswordCorrect(password)

    // If Password Is wrong so send error
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid user credentials" })
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //store in cookie 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
                "User Logged In Successfully"
            )
        )
});

// Logout Function
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
});

// Get User Data
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, { user: req.user }, "User fetched successfully")
        )
});

// Get All User Data
export const getAllUser = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUserId }, isAdmin: false }); // Exclude the logged-in user

    return res.status(200)
        .json(
            new ApiResponse(200, { users }, "All Users Fetched Successfully")
        )
});

// ForgetPassword
export const changePassword = asyncHandler(async (req, res, next) => {
    const { newPassword, password } = req.body;
    validateField(password, "password", res);
    validateField(newPassword, "password", res);

    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {

        return res.status(400).json(
            { message: "Invalid old password" }
        )
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
});


// updateAccountDetails
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { lastName, firstName, password } = req.body;
    validateField(firstName, "firstName", res);
    validateField(lastName, "lastName", res);
    validateField(password, "password", res);

    console.log(req.file.path);
    const avatarLocalPath = await req.file.path;
    if (!avatarLocalPath) {
        return res.status(400).json({ message: "Profile Image is required" })
    }
    console.log(avatarLocalPath);
    
    validateFile(avatarLocalPath, "10")

    // Check User Exits or not
    const user = await User.findOne({ _id: req.user._id });
    const oldImgId = user.profileImage;

    // if not exist in database then send error
    if (!user) { return res.status(404).json({ message: "User does Not Exist" }) }

    const isPasswordValid = await user.isPasswordCorrect(password)

    // Password valid or not 
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid user credentials" })
    }
    
    // Upload Image on Cloudinary
    const avatarImage = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarImage) {
        return res.status(400).json({ message: "Error while uploading a avatar" })
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    profileImage: {
                        imgId: avatarImage.public_id,
                        imgUrl: avatarImage.url
                    }
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");
        if (oldImgId?.imgId) {
            console.log("Delete");
            const avatarImageDelete = await deleteFromCloudinary(oldImgId.imgId);
        }
        // Return Response
        return res
            .status(200)
            .json(
                new ApiResponse(200, { user }, "Account details updated successfully")
            )
    } catch (error) {
        throw new ApiError(401, error)
    }
});

// Delete User Account
export const deleteUser = asyncHandler(async (req, res) => {
    const id = req.body?.id || req?.user?._id;
    if (!id || id === "") {
        return res.status(400).json(new ApiResponse(400, {}, "id not valid"));
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, { user }, "User not found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Account Deleted successfully")
        )
});


// Update isAdmin Field Function
export const updateIsAdminField = asyncHandler(async (req, res) => {
    const { userId, isAdmin } = req.body;

    // Validate isAdmin field if necessary
    // For example, if isAdmin can only be true or false, you can add validation here

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        // If user doesn't exist, return 404 error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update isAdmin field
        user.isAdmin = isAdmin;

        // Save the updated user
        const updatedUser = await user.save();

        // Omit sensitive data from response
        updatedUser.password = undefined;
        updatedUser.refreshToken = undefined;

        // Return success response
        return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "isAdmin field updated successfully"));
    } catch (error) {
        // Handle errors
        return res.status(500).json({ message: "Failed to update isAdmin field", error });
    }
});
