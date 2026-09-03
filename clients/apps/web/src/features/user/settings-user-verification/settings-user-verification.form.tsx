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
import { useResendSettingsUserVerificationCode } from "./use-resend-settings-user-verification-code.ts";
import { useSettingsUserVerification } from "./use-settings-user-verification.ts";

const verificationSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
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
			setErrorMessage(
				error instanceof Error ? error.message : "Unable to resend the code",
			);
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
				setErrorMessage(
					error instanceof Error ? error.message : "Unable to verify the code",
				);
			}
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">Verification</h2>
				<p className="text-sm text-muted-foreground">
					Enter the 6-digit code sent to your email address.
				</p>
			</div>

			{errorMessage ? (
				<Alert colorScheme="destructive">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
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
								<FieldLabel htmlFor={field.name}>Verification code</FieldLabel>
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
							Verify
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
				Didn't receive a code?{" "}
				<button
					type="button"
					onClick={() => void resendCode()}
					disabled={resend.isPending}
					className="inline-flex cursor-pointer items-center gap-1.5 text-foreground underline underline-offset-3 hover:text-foreground/80 disabled:pointer-events-none disabled:opacity-50"
				>
					Resend
					{resend.isPending ? (
						<RiLoader4Line className="size-3.5 animate-spin" />
					) : null}
				</button>
			</p>
		</div>
	);
}

export { SettingsUserVerificationForm };
