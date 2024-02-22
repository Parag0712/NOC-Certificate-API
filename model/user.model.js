import mongoose from "mongoose";

// USER SCHEMA 
const userSchema = new mongoose.Schema({
    firstName :{
        type:String,
        trim: true,
    },
    lastName :{
        type:String,
        trim: true,
    },
    email:{
        type:String,
        index:true,
        trim:true,
        required:true,
        unique: true,
    },
    number:{
        type:Number,
        trim:true,
        unique: true,
    },
    profileImage:{
        imgId: {
            type: String,
        },
        imgUrl: {
            type: String,
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    certificateIssue:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Certificate"
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
},
{ timestamps: true })

export const User = mongoose.Model("User",userSchema);