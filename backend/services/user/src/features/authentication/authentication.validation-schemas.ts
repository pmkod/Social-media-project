import { z } from "@hono/zod-openapi";

const SignupValidationSchema = z.object({
	email: z.string().email(),
	username: z.string().min(3).max(50),
	password: z.string().min(8),
	fullName: z.string().min(1).optional(),
});

const LoginValidationSchema = z.object({
	emailOrUsername: z.string().min(1),
	password: z.string().min(1),
});

const UserVerificationInputSchema = z.object({
	id: z.string(),
	token: z.string(),
});

const CompleteSignupValidationSchema = z.object({
	userVerification: UserVerificationInputSchema,
});

const CompleteLoginValidationSchema = z.object({
	userVerification: UserVerificationInputSchema,
});

const DoUserVerificationValidationSchema = z.object({
	userVerification: UserVerificationInputSchema,
	code: z.string().length(6),
});

const ResendUserVerificationCodeValidationSchema = z.object({
	userVerification: UserVerificationInputSchema,
});

const PasswordResetValidationSchema = z.object({
	email: z.string().email(),
});

const NewPasswordValidationSchema = z.object({
	userVerification: UserVerificationInputSchema,
	newPassword: z.string().min(8),
});

const RefreshTokenValidationSchema = z.object({
	refreshToken: z.string(),
});

export {
	SignupValidationSchema,
	LoginValidationSchema,
	CompleteSignupValidationSchema,
	CompleteLoginValidationSchema,
	DoUserVerificationValidationSchema,
	ResendUserVerificationCodeValidationSchema,
	PasswordResetValidationSchema,
	NewPasswordValidationSchema,
	RefreshTokenValidationSchema,
};
