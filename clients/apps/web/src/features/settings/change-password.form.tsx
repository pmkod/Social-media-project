import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
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
import { useChangePassword } from "./settings.api.ts";

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Enter your current password."),
		newPassword: UserValidationSchema.shape.password,
		confirmPassword: z.string().min(1, "Confirm your new password."),
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
	const changePassword = useChangePassword();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const inputClassName = "border-0 bg-muted/70 shadow-none";

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: { onSubmit: changePasswordSchema },
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			try {
				await changePassword.mutateAsync({
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
				});
				toast.success("Password updated");
				onSuccess();
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : "Unable to update password",
				);
			}
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
			onChange={() => setErrorMessage(null)}
			className="space-y-7"
		>
			{errorMessage ? (
				<Alert colorScheme="destructive">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}

			<FieldGroup>
				<form.Field name="currentPassword">
					{(field) => (
						<Field data-invalid={!field.state.meta.isValid}>
							<FieldLabel htmlFor={field.name}>Current password</FieldLabel>
							<PasswordInput
								id={field.name}
								size="lg"
								className={inputClassName}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								autoComplete="current-password"
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="newPassword">
					{(field) => (
						<Field data-invalid={!field.state.meta.isValid}>
							<FieldLabel htmlFor={field.name}>New password</FieldLabel>
							<PasswordInput
								id={field.name}
								size="lg"
								className={inputClassName}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								autoComplete="new-password"
							/>
							<FieldDescription>At least 8 characters</FieldDescription>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="confirmPassword">
					{(field) => (
						<Field data-invalid={!field.state.meta.isValid}>
							<FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
							<PasswordInput
								id={field.name}
								size="lg"
								className={inputClassName}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								autoComplete="new-password"
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			<div className="flex justify-end">
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" isLoading={isSubmitting}>
							Save password
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}

export { ChangePasswordForm };
