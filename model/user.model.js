import mongoose from "mongoose";
import bcrypt  from "bcrypt";
import jwt from 'jsonwebtoken';
import crypto from "crypto"
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
    ResetPasswordToken:String,
    ResetPasswordExpire:String
},
{ timestamps: true })


// Make Password hash
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

// For Validate Password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}


// Using This you can AccessToken
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            isAdmin:this.isAdmin
        },
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

// Generate RefreshToken
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// getResetToken
userSchema.methods.getResetToken= function(){
    const resetToken = crypto.randomBytes(20).toString("hex") 
    this.ResetPasswordToken = crypto.createHash("sha256").update(resetToken).digest();
    this.ResetPasswordExpire = Date.now() + 2 * 60 * 1000;
    return resetToken;
}
export const User = mongoose.model("User",userSchema);