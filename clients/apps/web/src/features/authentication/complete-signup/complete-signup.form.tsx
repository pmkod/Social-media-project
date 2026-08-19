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
			} catch (error: any) {
				setErrorMessage(error.message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">
					Choose a username
				</h2>
				<p className="text-sm text-muted-foreground">
					This name will be visible to other users.
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
								<FieldLabel htmlFor={field.name}>Username</FieldLabel>
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
							{isSubmitting ? "Finishing..." : "Complete sign-up"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

export { CompleteSignupForm };
