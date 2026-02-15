import z from "zod";
import { UserValidationSchema } from "../user/user.validation-schemas";

const loginValidationSchema = z.object({
	email: UserValidationSchema.shape.email,
	password: UserValidationSchema.shape.password,
});

const SignupValidationSchema = z.object({
	email: UserValidationSchema.shape.email,
});

const CompleteSignupValidationSchema = z.object({
	fullName: UserValidationSchema.shape.fullName,
	username: UserValidationSchema.shape.username,
	password: UserValidationSchema.shape.password,
});
// Schema for email validation
const passordResetValidationSchema = z.object({
	email: UserValidationSchema.shape.email,
});

const newPasswordValidationSchema = z.object({
	newPassword: UserValidationSchema.shape.password,
	confirmNewPassword: z.string(),
});

const userVerificationValidationSchema = z.object({
	code: z.string(),
});

export {
	CompleteSignupValidationSchema,
	loginValidationSchema,
	newPasswordValidationSchema,
	passordResetValidationSchema,
	SignupValidationSchema,
	userVerificationValidationSchema,
};
