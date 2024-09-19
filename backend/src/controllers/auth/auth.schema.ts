import { z } from "zod";

export const emailSchema = z.string().email().min(1).max(255);

const passwordSchema = z.string().min(6).max(20);

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,   
    userAgent: z.string().optional(),
});

export const registerSchema = loginSchema.extend({
    confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
});

export const verifyEmailCodeSchema = z.string().min(6).max(24);

export const resetPasswordSchema = z.object({
    password: passwordSchema,
    verificationCode: verifyEmailCodeSchema,
});