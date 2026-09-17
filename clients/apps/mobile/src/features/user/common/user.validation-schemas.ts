import { z } from "zod";

export const UserValidationSchema = z.object({
	id: z.string(),
	username: z
		.string()
		.min(3, "Username must contain at least 3 characters.")
		.max(50, "Username must contain no more than 50 characters."),
	fullName: z
		.string()
		.min(1, "Full name is required.")
		.max(100, "Full name must contain no more than 100 characters."),
	email: z.string().email("Enter a valid email address."),
	password: z
		.string()
		.min(8, "Password must contain at least 8 characters."),
});
