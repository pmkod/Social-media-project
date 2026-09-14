import { RiLoader4Line } from "@remixicon/react";
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

import * as m from "@/paraglide/messages.js";
import { useResendSettingsUserVerificationCode } from "./use-resend-settings-user-verification-code.ts";
import { useSettingsUserVerification } from "./use-settings-user-verification.ts";

const verificationSchema = z.object({
	code: z.string().regex(/^\d{6}$/, {
		error: () => m.validation_verification_code_format(),
	}),
});

type SettingsUserVerificationFormProps = {
	onSuccess: () => void | Promise<void>;
};

function SettingsUserVerificationForm({
	onSuccess,
}: SettingsUserVerificationFormProps) {
	const settingsUserVerification = useSettingsUserVerification();
	const resend = useResendSettingsUserVerificationCode();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const resendCode = async () => {
		clearErrorMessage();
		try {
			await resend.mutateAsync();
		} catch (error) {
			setErrorMessage((error as Error).message);
		}
	};

	const form = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: verificationSchema },
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await settingsUserVerification.mutateAsync({ code: value.code });
				await onSuccess();
			} catch (error) {
				setErrorMessage((error as Error).message);
			}
		},
	});

	return (
		<div className="flex flex-col">
			<div className="flex flex-col gap-1 mb-2">
				<p className="text-sm text-muted-foreground">
					{m.auth_verification_description()}
				</p>
			</div>

			{errorMessage ? (
				<div className="mb-2">
					<Alert colorScheme="destructive">
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				</div>
			) : null}

			<form
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
				onChange={clearErrorMessage}
				className="flex flex-col gap-6"
			>
				<FieldGroup>
					<form.Field name="code">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									{m.auth_verification_code()}
								</FieldLabel>
								<Input
									id={field.name}
									size="lg"
									type="text"
									inputMode="numeric"
									maxLength={6}
									placeholder="123456"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									autoComplete="one-time-code"
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
							{m.auth_verify()}
						</Button>
					)}
				</form.Subscribe>
			</form>
			<p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground mt-2">
				{m.auth_code_not_received()}{" "}
				<button
					type="button"
					onClick={() => void resendCode()}
					disabled={resend.isPending}
					className="inline-flex cursor-pointer items-center gap-1.5 text-foreground underline underline-offset-3 hover:text-foreground/80 disabled:pointer-events-none disabled:opacity-50"
				>
					{m.auth_resend()}
					{resend.isPending ? (
						<RiLoader4Line className="size-3.5 animate-spin" />
					) : null}
				</button>
			</p>
		</div>
	);
}

export { SettingsUserVerificationForm };
