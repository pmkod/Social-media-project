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
import { useSignup } from "./use-signup";

const signupSchema = z.object({
	fullName: UserValidationSchema.shape.fullName,
	email: UserValidationSchema.shape.email,
	password: UserValidationSchema.shape.password,
});

type SignupFormProps = {
	onSuccess: () => void;
};

function SignupForm({ onSuccess }: SignupFormProps) {
	const signup = useSignup();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const form = useForm({
		defaultValues: {
			// fullName: "Kodossou Kouassi",
			// email: "pierremariekod@gmail.com",
			// password: "pierremariekod@gmail.com",
			fullName: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signupSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await signup.mutateAsync({
					fullName: value.fullName,
					email: value.email,
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
				<h2 className="text-2xl font-semibold tracking-tight">
					Create an account
				</h2>
				<p className="text-sm text-muted-foreground">
					Join us in just a few seconds.
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
					<form.Field name="fullName">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>Full name</FieldLabel>
								<Input
									id={field.name}
									size="lg"
									type="text"
									placeholder="John Doe"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="name"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									size="lg"
									type="email"
									placeholder="you@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="email"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
							{isSubmitting ? "Creating..." : "Create an account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					to="/"
					className="text-foreground underline underline-offset-3 hover:text-foreground/80"
				>
					Log in
				</Link>
			</p>
		</div>
	);
}

export { SignupForm };
