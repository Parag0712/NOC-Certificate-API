import asyncHandler from "../utils/asyncHandler.js";

//Register Function 
export const register = asyncHandler(async(req,res)=>{
    res.send("Hello");
})