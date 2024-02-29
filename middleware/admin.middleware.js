import jwt from 'jsonwebtoken'
import { User } from '../model/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';


// Using this function you get userId based on token
const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();
        
        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Decode out Token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            // HANDLE IN FRONTEND SIDE
            throw new ApiError(401, "Invalid Access Token");
        }

        if(user.isAdmin == false){
            throw new ApiError(401, "You can't Access This Data");
        }
        
        // You Store in Your Object
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
});

export { verifyAdmin }