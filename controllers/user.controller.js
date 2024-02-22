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

    const responseData = {
        user: user,
        tokens: {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    };


    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, responseData, "User Register Successfully"));
});


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    
})