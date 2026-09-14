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
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import * as m from "@/paraglide/messages.js";
import { useChangePassword } from "./use-change-password.ts";

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, {
			error: () => m.validation_required(),
		}),
		newPassword: UserValidationSchema.shape.password,
		confirmPassword: z.string().min(1, {
			error: () => m.validation_required(),
		}),
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		error: () => m.validation_password_mismatch(),
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
				toast.success(m.settings_password_updated());
				onSuccess();
			} catch (error) {
				setErrorMessage(getExceptionMessage(error));
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
							<FieldLabel htmlFor={field.name}>
								{m.settings_current_password()}
							</FieldLabel>
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
							<FieldLabel htmlFor={field.name}>
								{m.settings_new_password()}
							</FieldLabel>
							<PasswordInput
								id={field.name}
								size="lg"
								className={inputClassName}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								autoComplete="new-password"
							/>
							<FieldDescription>
								{m.settings_password_minimum()}
							</FieldDescription>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="confirmPassword">
					{(field) => (
						<Field data-invalid={!field.state.meta.isValid}>
							<FieldLabel htmlFor={field.name}>
								{m.settings_confirm_password()}
							</FieldLabel>
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
							{m.settings_save_password()}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}

export { ChangePasswordForm };
