import asyncHandler from 'express-async-handler';
import { registerSchema } from './auth.schema';

export const registerHandler = asyncHandler(async (req, res) => {
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });




});   