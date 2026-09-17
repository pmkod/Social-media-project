import { useForm } from "@tanstack/react-form";
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

import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import * as m from "@/paraglide/messages.js";
import { useCompleteSignup } from "./use-complete-signup";

const completeSignupSchema = z.object({
	username: UserValidationSchema.shape.username,
});

type CompleteSignupFormProps = {
	onSuccess: () => void;
};

function CompleteSignupForm({ onSuccess }: CompleteSignupFormProps) {
	const completeSignup = useCompleteSignup();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const form = useForm({
		defaultValues: {
			username: "",
		},
		validators: {
			onSubmit: completeSignupSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await completeSignup.mutateAsync({ username: value.username });
				onSuccess();
			} catch (error) {
				setErrorMessage((error as Error).message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">
					{m.auth_choose_username()}
				</h2>
				<p className="text-sm text-muted-foreground">
					{m.auth_username_description()}
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
					<form.Field name="username">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									{m.auth_username()}
								</FieldLabel>
								<Input
									id={field.name}
									size="lg"
									type="text"
									placeholder="johndoe"
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
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
							{isSubmitting
								? m.auth_finishing_signup()
								: m.auth_complete_signup()}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

export { CompleteSignupForm };
