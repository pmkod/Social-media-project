import { z } from "zod";

const UserValidationSchema = z.object({
	id: z.string(),
	firstName: z
		.string()
		.min(1, "Le prénom est requis")
		.max(100, "Le prénom ne doit pas dépasser 100 caractères"),
	lastName: z
		.string()
		.min(1, "Le nom est requis")
		.max(100, "Le nom ne doit pas dépasser 100 caractères"),
	email: z
		.string()
		.min(1, "L'email est requis")
		.max(255, "L'email ne doit pas dépasser 255 caractères")
		.regex(
			/^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			"Email invalide",
		),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export { UserValidationSchema };
