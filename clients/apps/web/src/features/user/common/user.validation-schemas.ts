import { z } from "zod";
import * as m from "@/paraglide/messages.js";

const UserValidationSchema = z.object({
	id: z.string(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters long")
		.max(50, "Username must be no more than 50 characters long"),
	fullName: z
		.string({
			error: () => m.validation_required(),
		})
		.min(1, {
			error: () => m.validation_required(),
		})
		.max(100, {
			error: (issue) => m.validation_max_length({ max: Number(issue.maximum) }),
		}),
	email: z.email({
		error: () => m.validation_invalid_email(),
	}),
	password: z
		.string({
			error: () => m.validation_required(),
		})
		.min(8, {
			error: (issue) => m.validation_min_length({ min: Number(issue.minimum) }),
		}),
});

export { UserValidationSchema };
