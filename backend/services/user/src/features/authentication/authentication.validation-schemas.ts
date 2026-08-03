import { z } from "@hono/zod-openapi";

const SignupValidationSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	fullName: z.string().min(1).optional(),
});

const LoginValidationSchema = z.object({
	emailOrUsername: z.string().min(1),
	password: z.string().min(1),

});

const UserVerificationSchema = z.object({
	id: z.string(),
	token: z.string(),
	code: z.string().length(6)
});

const CompleteSignupValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationSchema.shape.id,
		token: UserVerificationSchema.shape.token,
	}),
	username: z.string().min(3).max(50),
});

const CompleteLoginValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationSchema.shape.id,
		token: UserVerificationSchema.shape.token,
	}),
});

const DoUserVerificationValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationSchema.shape.id,
		token: UserVerificationSchema.shape.token,
		code: UserVerificationSchema.shape.code,

	}),
});

const ResendUserVerificationCodeValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationSchema.shape.id,
		token: UserVerificationSchema.shape.token,
	}),
});

const PasswordResetValidationSchema = z.object({
	email: z.string().email(),
});

const NewPasswordValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationSchema.shape.id,
		token: UserVerificationSchema.shape.token,
	}),
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
