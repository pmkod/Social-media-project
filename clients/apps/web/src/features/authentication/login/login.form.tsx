import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/core/components/ui/alert.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { PasswordInput } from "@/core/components/ui/password-input.tsx";
import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import { useLogin } from "./use-login";

const loginSchema = z.object({
	emailOrUsername: z
		.string()
		.min(1, "L'email ou le nom d'utilisateur est requis"),
	password: UserValidationSchema.shape.password,
});

type LoginFormProps = {
	onSuccess: () => void;
};

function LoginForm({ onSuccess }: LoginFormProps) {
	const login = useLogin();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const form = useForm({
		defaultValues: {
			emailOrUsername: "pierremariekod@gmail.com",
			password: "pierremariekod@gmail.com",
		},
		validators: {
			onSubmit: loginSchema,
		},

		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await login.mutateAsync({
					emailOrUsername: value.emailOrUsername,
					password: value.password,
				});
				onSuccess();
			} catch (error: any) {
				setErrorMessage(error.message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
				<p className="text-sm text-muted-foreground">
					Entrez vos identifiants pour accéder à votre compte.
				</p>
			</div>

			{errorMessage ? (
				<Alert colorScheme="destructive">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				onChange={clearErrorMessage}
				className="flex flex-col gap-6"
			>
				<FieldGroup>
					<form.Field name="emailOrUsername">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									Email ou nom d'utilisateur
								</FieldLabel>
								<Input
									id={field.name}
									type="text"
									placeholder="Email ou nom d'utilisateur"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="username"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
									<Link
										to="/password-reset"
										className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-3"
									>
										Mot de passe oublié ?
									</Link>
								</div>
								<PasswordInput
									id={field.name}
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="current-password"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" fullWidth disabled={isSubmitting}>
							{isSubmitting ? "Connexion..." : "Se connecter"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Pas encore de compte ?{" "}
				<Link
					to="/signup"
					className="text-foreground underline underline-offset-3 hover:text-foreground/80"
				>
					S'inscrire
				</Link>
			</p>
		</div>
	);
}

export { LoginForm };
