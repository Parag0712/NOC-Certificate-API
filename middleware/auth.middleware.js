
import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


// Using this function you get userId based on token
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();
        // const token = req.header("Authorization")?.replace("Bearer", "").trim();
        
        if (!token) {
            return res.status(400).json({message:"Unauthorized request"})
        }

        // Decode out Token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password ");

        if (!user) { return res.status(400).json({message:"Invalid Access Token"}) }

        
        // You Store in Your Object
        req.user = user;
        req.aToken = token
        req.rToken = user.refreshToken
        next();
    } catch (error) {
        return res.status(400).json({message:"Invalid Access Token"})
    }
});

export { verifyJWT }