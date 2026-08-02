import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
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
import { loggedInUserQueryKey } from "@/features/user/get-logged-in-user/use-logged-in-user.ts";
import { useCompleteLogin } from "../complete-login/use-complete-login";
import { useCompleteSignup } from "../complete-signup/use-complete-signup";
import { useResendUserVerificationCode } from "../resend-user-verification-code/use-resend-user-verification-code";
import { useUserVerification } from "./use-user-verification";
import { UserVerificationGoals } from "./user-verification-gloal";
import type { UserVerificationGoalType } from "./user-verification-goal.type";

const verificationSchema = z.object({
	code: z
		.string()
		.length(6, "Le code doit contenir exactement 6 chiffres.")
		.refine((val) => val.split("").every((c) => c >= "0" && c <= "9"), {
			message: "Le code doit contenir uniquement des chiffres.",
		}),
});

type UserVerificationFormProps = {
	onSuccess: () => void | Promise<void>;
	goal: UserVerificationGoalType;
};

function UserVerificationForm({ onSuccess, goal }: UserVerificationFormProps) {
	const userVerification = useUserVerification();
	const resend = useResendUserVerificationCode();
	const completeLogin = useCompleteLogin();
	const completeSignup = useCompleteSignup();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const clearErrorMessage = () => setErrorMessage(null);

	const resendCode = async () => {
		await resend.mutateAsync();
	};

	const form = useForm({
		defaultValues: {
			code: "",
		},
		validators: {
			onSubmit: verificationSchema,
		},
		onSubmit: async ({ value }) => {
			clearErrorMessage();
			try {
				await userVerification.mutateAsync({ code: value.code });
				if (goal === UserVerificationGoals.login) {
					await completeLogin.mutateAsync();
					// await queryClient.fetchQuery({ queryKey: loggedInUserQueryKey });
				} else if (goal === UserVerificationGoals.signup) {
					await completeSignup.mutateAsync();
					// await queryClient.fetchQuery({ queryKey: loggedInUserQueryKey });
				}
				await onSuccess();
			} catch (error: any) {
				setErrorMessage(error.message);
			}
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-semibold tracking-tight">Vérification</h2>
				<p className="text-sm text-muted-foreground">
					Entrez le code à 6 chiffres envoyé à votre adresse email.
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
					<form.Field name="code">
						{(field) => (
							<Field data-invalid={!field.state.meta.isValid}>
								<FieldLabel htmlFor={field.name}>
									Code de vérification
								</FieldLabel>
								<Input
									id={field.name}
									type="text"
									inputMode="numeric"
									placeholder="123456"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={!field.state.meta.isValid}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" fullWidth disabled={isSubmitting}>
							{isSubmitting ? "Vérification..." : "Vérifier"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Vous n'avez pas reçu de code ?{" "}
				<button
					type="button"
					onClick={resendCode}
					className="text-foreground underline underline-offset-3 hover:text-foreground/80"
				>
					Renvoyer
				</button>
			</p>
		</div>
	);
}

export { UserVerificationForm };
