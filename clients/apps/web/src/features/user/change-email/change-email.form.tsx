import { useForm } from "@tanstack/react-form";
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
import { useRequestEmailChange } from "./use-request-email-change.ts";

const emailSchema = z.object({
	newEmail: UserValidationSchema.shape.email,
});

type ChangeEmailFormProps = {
	currentEmail?: string;
	onSuccess: () => void | Promise<void>;
};

function ChangeEmailForm({ currentEmail, onSuccess }: ChangeEmailFormProps) {
	const requestEmailChange = useRequestEmailChange();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const inputClassName = "border-0 bg-muted/70 shadow-none";

	const form = useForm({
		defaultValues: { newEmail: "" },
		validators: { onSubmit: emailSchema },
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			try {
				await requestEmailChange.mutateAsync(value.newEmail);
				await onSuccess();
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : "Unable to send the code",
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
				<Field>
					<FieldLabel>Current email</FieldLabel>
					<p className="rounded bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
						{currentEmail ?? "Loading..."}
					</p>
				</Field>

				<form.Field name="newEmail">
					{(field) => (
						<Field data-invalid={!field.state.meta.isValid}>
							<FieldLabel htmlFor={field.name}>New email</FieldLabel>
							<Input
								id={field.name}
								type="email"
								size="lg"
								className={inputClassName}
								placeholder="you@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								autoComplete="email"
							/>
							<FieldDescription>
								We will send a verification code to this address.
							</FieldDescription>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			<div className="flex justify-end">
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" isLoading={isSubmitting}>
							Send verification code
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}

export { ChangeEmailForm };
