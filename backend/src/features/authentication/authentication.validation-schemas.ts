import { z } from "@hono/zod-openapi";
import { USER_ROLES } from "../user/user-roles.constants";
import { UserValidationSchema } from "../user/user.validation.schemas";

const SignupValidationSchema = z.object({
	storeName: UserValidationSchema.shape.storeName.optional(),
	firstName: UserValidationSchema.shape.firstName.optional(),
	lastName: UserValidationSchema.shape.lastName.optional(),
	email: UserValidationSchema.shape.email,
	password: UserValidationSchema.shape.password,
	role: z.enum([USER_ROLES.customer, USER_ROLES.seller]),
});

type SignupValidationSchemaType = z.infer<typeof SignupValidationSchema>;

const UserVerificationValidationSchema = z.object({
	id: z.string(),
	code: z.string(),
	token: z.string(),
});

const CompleteSignupValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationValidationSchema.shape.id,
		token: UserVerificationValidationSchema.shape.token,
	}),
});

const LoginValidationSchema = z.object({
	email: UserValidationSchema.shape.email,
	password: UserValidationSchema.shape.password,
});
type LoginValidationSchemaType = z.infer<typeof LoginValidationSchema>;

const CompleteLoginValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationValidationSchema.shape.id,
		token: UserVerificationValidationSchema.shape.token,
	}),
});

const PasswordResetValidationSchema = z.object({
	email: UserValidationSchema.shape.email,
});

type PasswordResetValidationSchemaType = z.infer<
	typeof PasswordResetValidationSchema
>;

const NewPasswordValidationSchema = z.object({
	newPassword: UserValidationSchema.shape.password,
	userVerification: z.object({
		id: UserVerificationValidationSchema.shape.id,
		token: UserVerificationValidationSchema.shape.token,
	}),
});

const ResendUserVerificationCodeValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationValidationSchema.shape.id,
		token: UserVerificationValidationSchema.shape.token,
	}),
});

const DoUserVerificationValidationSchema = z.object({
	userVerification: z.object({
		id: UserVerificationValidationSchema.shape.id,
		code: UserVerificationValidationSchema.shape.code,
		token: UserVerificationValidationSchema.shape.token,
	}),
});

const refreshTokenValidationSchema = z.jwt();

const GenerateNewAccessTokenValidationSchema = z.object({
	refreshToken: refreshTokenValidationSchema,
});

export {
	CompleteLoginValidationSchema,
	CompleteSignupValidationSchema,
	DoUserVerificationValidationSchema,
	GenerateNewAccessTokenValidationSchema,
	LoginValidationSchema,
	NewPasswordValidationSchema,
	PasswordResetValidationSchema,
	refreshTokenValidationSchema,
	ResendUserVerificationCodeValidationSchema,
	SignupValidationSchema,
	UserVerificationValidationSchema,
	type LoginValidationSchemaType,
	type PasswordResetValidationSchemaType,
	type SignupValidationSchemaType,
};
