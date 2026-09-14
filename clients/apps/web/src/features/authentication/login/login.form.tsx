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
import * as m from "@/paraglide/messages.js";
import { useLogin } from "./use-login";

const loginSchema = z.object({
	emailOrUsername: z.string().min(1, {
		error: () => m.validation_required(),
	}),
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
			// emailOrUsername: "",
			// password: "",
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
				<h2 className="text-2xl font-semibold tracking-tight">
					{m.auth_login_title()}
				</h2>
				<p className="text-sm text-muted-foreground">
					{m.auth_login_description()}
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
									{m.auth_email_or_username()}
								</FieldLabel>
								<Input
									id={field.name}
									size="lg"
									type="text"
									placeholder={m.auth_email_or_username()}
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
									<FieldLabel htmlFor={field.name}>
										{m.auth_password()}
									</FieldLabel>
									<Link
										to="/password-reset"
										className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-3"
									>
										{m.auth_forgot_password_link()}
									</Link>
								</div>
								<PasswordInput
									id={field.name}
									size="lg"
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
						<Button type="submit" size={"lg"} fullWidth disabled={isSubmitting}>
							{isSubmitting ? m.auth_logging_in() : m.auth_login_title()}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				{m.auth_no_account()}{" "}
				<Link
					to="/signup"
					className="text-foreground underline underline-offset-3 hover:text-foreground/80"
				>
					{m.auth_signup_link()}
				</Link>
			</p>
		</div>
	);
}

export { LoginForm };
