import mongoose from "mongoose";
const certificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);

