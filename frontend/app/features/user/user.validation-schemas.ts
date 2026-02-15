import z from "zod";

const UserValidationSchema = z.object({
	fullName: z.string("Full name field required"),
	username: z.string("Username field required"),
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export { UserValidationSchema };
