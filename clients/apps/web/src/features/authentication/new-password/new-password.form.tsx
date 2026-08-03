import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/core/components/ui/alert.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { PasswordInput } from "@/core/components/ui/password-input.tsx";
import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import { loggedInUserQueryKey } from "@/features/user/get-logged-in-user/use-logged-in-user.ts";
import { useNewPassword } from "./use-new-password";

const newPasswordSchema = z
	.object({
		password: UserValidationSchema.shape.password,
		confirmPassword: z
			.string()
			.min(1, "Veuillez confirmer votre mot de passe."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas.",
		path: ["confirmPassword"],
	});

type NewPasswordFormProps = {
	onSuccess: () => void;
};

function NewPasswordForm({ onSuccess }: NewPasswordFormProps) {
	const newPassword = useNewPassword();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const clearErrorMessage = () => setErrorMessage(null);

	const form = useForm({
		defaultValues: {
			password: "pierremariekod@gmail.com",
			confirmPassword: "pierremariekod@gmail.com",
		},
		validators: {
			onSubmit: newPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await newPassword.mutateAsync({ newPassword: value.password });
				await queryClient.fetchQuery({ queryKey: loggedInUserQueryKey });

				onSuccess();
			} catch (error: any) {
				setErrorMessage(error.message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">
					Nouveau mot de passe
				</h2>
				<p className="text-sm text-muted-foreground">
					Choisissez un nouveau mot de passe sécurisé.
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
					<form.Field name="password">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									Nouveau mot de passe
								</FieldLabel>
								<PasswordInput
									id={field.name}
									size="lg"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="new-password"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldDescription>Minimum 8 caractères</FieldDescription>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="confirmPassword">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									Confirmer le mot de passe
								</FieldLabel>
								<PasswordInput
									id={field.name}
									size="lg"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="new-password"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
							{isSubmitting
								? "Enregistrement..."
								: "Enregistrer le mot de passe"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

export { NewPasswordForm };
