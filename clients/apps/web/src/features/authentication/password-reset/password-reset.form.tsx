import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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
import { Input } from "@/core/components/ui/input.tsx";
import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import { usePasswordReset } from "./use-password-reset";

const passwordResetSchema = z.object({
	email: UserValidationSchema.shape.email,
});

type PasswordResetFormProps = {
	onSuccess: () => void;
};

function PasswordResetForm({ onSuccess }: PasswordResetFormProps) {
	const passwordReset = usePasswordReset();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const form = useForm({
		defaultValues: {
			email: "pierremariekod@gmail.com",
		},
		validators: {
			onSubmit: passwordResetSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await passwordReset.mutateAsync({ email: value.email });
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
					Mot de passe oublié
				</h2>
				<p className="text-sm text-muted-foreground">
					Saisissez votre email pour recevoir un lien de réinitialisation.
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
					<form.Field name="email">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									type="email"
									placeholder="you@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="email"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldDescription>
									Nous vous enverrons un lien de réinitialisation.
								</FieldDescription>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" fullWidth disabled={isSubmitting}>
							{isSubmitting ? "Envoi..." : "Envoyer le lien"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Retour à la{" "}
				<Link
					to="/"
					className="text-foreground underline underline-offset-3 hover:text-foreground/80"
				>
					connexion
				</Link>
			</p>
		</div>
	);
}

export { PasswordResetForm };
