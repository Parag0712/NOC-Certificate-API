import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import vine, { errors } from "@vinejs/vine";
import ApiResponse from "../utils/ApiResponse.js";

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
export const ForgetPassword = asyncHandler(async (req, res, next) => {
    const { newPassword, password } = req.body;
    validateField(password,"password",res);
    validateField(newPassword,"password",res);
    
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


// Delete User Account
export const deleteUser = asyncHandler(async (req, res) => {
        const id = req.body?.id || req?.user?._id;
        if(!id || id === ""){
            return res.status(400).json(new ApiResponse(400, {}, "id not valid"));
        }
        
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, {user}, "User not found"));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Account Deleted successfully")
            )
});


