import mongoose from "mongoose";
import VerificationCodeType from "../constants/verificationCodeType";

export interface VerificationCodeDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    type: VerificationCodeType;
    createdAt: Date;
    expiresAt: Date;
};

const verificationCodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>("VerificationCode", verificationCodeSchema, 'verificationCodes');

export default VerificationCodeModel;