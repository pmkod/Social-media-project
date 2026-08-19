import { z } from "zod";

const UserValidationSchema = z.object({
	id: z.string(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters long")
		.max(50, "Username must be no more than 50 characters long"),
	fullName: z
		.string()
		.min(1, "Full name is required")
		.max(100, "Full name must be no more than 100 characters long"),
	email: z
		.string()
		.min(1, "Email is required")
		.max(255, "Email must be no more than 255 characters long")
		.regex(
			/^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			"Invalid email",
		),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export { UserValidationSchema };
