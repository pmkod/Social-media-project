import { RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/core/components/ui/input.tsx";
import { useResendUserVerificationCode } from "@/features/authentication/resend-user-verification-code/use-resend-user-verification-code.ts";
import { useUserVerification } from "@/features/authentication/user-verification/use-user-verification.ts";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import { UserValidationSchema } from "@/features/user/common/user.validation-schemas.ts";
import {
	useCompleteEmailChange,
	useRequestEmailChange,
} from "./settings.api.ts";

const emailSchema = z.object({
	newEmail: UserValidationSchema.shape.email,
});

const codeSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

function ChangeEmailForm({
	currentEmail,
	onSuccess,
}: {
	currentEmail?: string;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState<"email" | "verification">("email");
	const [pendingEmail, setPendingEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const requestEmailChange = useRequestEmailChange();
	const verifyCode = useUserVerification();
	const resendCode = useResendUserVerificationCode();
	const completeEmailChange = useCompleteEmailChange();
	const queryClient = useQueryClient();
	const inputClassName = "border-0 bg-muted/70 shadow-none";

	const emailForm = useForm({
		defaultValues: { newEmail: "" },
		validators: { onSubmit: emailSchema },
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			try {
				await requestEmailChange.mutateAsync(value.newEmail);
				setPendingEmail(value.newEmail);
				setStep("verification");
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : "Unable to send the code",
				);
			}
		},
	});

	const codeForm = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: codeSchema },
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			try {
				await verifyCode.mutateAsync({ code: value.code });
				await completeEmailChange.mutateAsync();
				await queryClient.invalidateQueries({
					queryKey: authenticatedUserQueryKey,
				});
				toast.success("Email address updated");
				onSuccess();
			} catch (error) {
				setErrorMessage(
					error instanceof Error ? error.message : "Unable to update email",
				);
			}
		},
	});

	const handleResend = async () => {
		setErrorMessage(null);
		try {
			await resendCode.mutateAsync();
			toast.success("A new code was sent");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Unable to resend the code",
			);
		}
	};

	if (step === "verification") {
		return (
			<div className="space-y-7">
				<button
					type="button"
					onClick={() => {
						setStep("email");
						setErrorMessage(null);
					}}
					className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<RiArrowLeftLine className="size-4" />
					Use another email
				</button>

				<div className="space-y-1">
					<h3 className="text-lg font-semibold">Check your inbox</h3>
					<p className="text-sm text-muted-foreground">
						Enter the code sent to {pendingEmail}.
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
						codeForm.handleSubmit();
					}}
					onChange={() => setErrorMessage(null)}
					className="space-y-7"
				>
					<FieldGroup>
						<codeForm.Field name="code">
							{(field) => (
								<Field data-invalid={!field.state.meta.isValid}>
									<FieldLabel htmlFor={field.name}>
										Verification code
									</FieldLabel>
									<Input
										id={field.name}
										size="lg"
										className={inputClassName}
										inputMode="numeric"
										maxLength={6}
										placeholder="123456"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</codeForm.Field>
					</FieldGroup>

					<div className="flex justify-end">
						<codeForm.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" size="lg" isLoading={isSubmitting}>
									Verify and save
								</Button>
							)}
						</codeForm.Subscribe>
					</div>
				</form>

				<button
					type="button"
					onClick={() => void handleResend()}
					disabled={resendCode.isPending}
					className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary disabled:pointer-events-none disabled:opacity-50"
				>
					Resend code
					{resendCode.isPending ? (
						<RiLoader4Line className="size-4 animate-spin" />
					) : null}
				</button>
			</div>
		);
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				emailForm.handleSubmit();
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

				<emailForm.Field name="newEmail">
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
				</emailForm.Field>
			</FieldGroup>

			<div className="flex justify-end">
				<emailForm.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" size="lg" isLoading={isSubmitting}>
							Send verification code
						</Button>
					)}
				</emailForm.Subscribe>
			</div>
		</form>
	);
}

export { ChangeEmailForm };
