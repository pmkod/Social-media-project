import { z } from "@hono/zod-openapi";

export const SignupValidationSchema = z.object({
	fullName: z.string().min(2).max(255),
	email: z.string().email().max(255),
	password: z.string().min(8).max(128),
});

export const UserVerificationSchema = z.object({
	id: z.string().uuid(),
	token: z.string().uuid(),
	code: z.string().length(6),
});

export const CompleteSignupValidationSchema = z.object({
	userVerification: UserVerificationSchema,
	username: z.string().min(3).max(50),
});

export const LoginValidationSchema = z.object({
	email: z.string().email().max(255),
	password: z.string().min(8).max(128),
});

export const CompleteLoginValidationSchema = z.object({
	userVerification: UserVerificationSchema,
});

export const PasswordResetValidationSchema = z.object({
	email: z.string().email().max(255),
});

export const DoUserVerificationValidationSchema = z.object({
	userVerification: UserVerificationSchema,
});
