import { User } from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema } from "../utils/authValidtaion.js";

//Register Function 
export const register = asyncHandler(async(req,res)=>{
    try {    
        const {email,password} = req.body;
        const validator = vine.compile(registerSchema);
        const payload = await validator.validate({email,password})
        console.log(payload);
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({
                message:error.message
            })

        }
    }
})

export const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
})