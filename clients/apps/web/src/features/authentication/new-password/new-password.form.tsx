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
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import { useNewPassword } from "./use-new-password";

const newPasswordSchema = z
	.object({
		password: UserValidationSchema.shape.password,
		confirmPassword: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
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
			// password: "pierremariekod@gmail.com",
			// confirmPassword: "pierremariekod@gmail.com",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: newPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await newPassword.mutateAsync({ newPassword: value.password });
				await queryClient.fetchQuery({ queryKey: authenticatedUserQueryKey });

				onSuccess();
			} catch (error: any) {
				setErrorMessage(error.message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">New password</h2>
				<p className="text-sm text-muted-foreground">
					Choose a new secure password.
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
								<FieldLabel htmlFor={field.name}>New password</FieldLabel>
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
								<FieldDescription>Minimum 8 characters</FieldDescription>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="confirmPassword">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
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
							{isSubmitting ? "Saving..." : "Save password"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

export { NewPasswordForm };
