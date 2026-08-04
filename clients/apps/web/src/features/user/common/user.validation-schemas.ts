import { z } from "zod";

const UserValidationSchema = z.object({
	id: z.string(),
	username: z
		.string()
		.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
		.max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères"),
	fullName: z
		.string()
		.min(1, "Le nom complet est requis")
		.max(100, "Le nom complet ne doit pas dépasser 100 caractères"),
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
