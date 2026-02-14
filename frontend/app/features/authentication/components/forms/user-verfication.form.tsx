"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { userVerificationValidationSchema } from "../../authentication.validation-schemas";
import { useUserVerification } from "../../mutations/use-user-verification";
import { useNavigate, useSearchParams } from "react-router";
import { routesBuilder } from "@/core/routes-builder";
import {
	USER_VERIFICATION_FIELDS_KEYS,
	USER_VERIFICATION_GOALS,
} from "../../authentication.constants";
import { useCompleteSignup } from "../../mutations/use-complete-signup";
import { useCompleteLogin } from "../../mutations/use-complete-login";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { USER_ROLES } from "@/features/user/constants/user-roles.constants";

const UserVerificationForm = () => {
	const {
		mutate: userVerificationMutation,
		isPending: isUserVerificationPending,
	} = useUserVerification();
	const { mutate: completeSignupMutation, isPending: isCompleteSignupPending } =
		useCompleteSignup();
	const { mutate: completeLoginMutation, isPending: isCompleteLoginPending } =
		useCompleteLogin();
	const [searchParams] = useSearchParams();

	const navigate = useNavigate();
	const isLoading =
		isUserVerificationPending ||
		isCompleteSignupPending ||
		isCompleteLoginPending;
	const goal = searchParams.get(USER_VERIFICATION_FIELDS_KEYS.goal);
	const form = useForm({
		resolver: zodResolver(userVerificationValidationSchema),
		defaultValues: {
			code: "",
		},
	});

	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((values) => {
		userVerificationMutation(values, {
			onSuccess: () => {
				if (goal === USER_VERIFICATION_GOALS.signup) {
					completeSignupMutation(undefined, {
						onSuccess: (data) => {
							if (data.user.role === USER_ROLES.customer) {
								navigate(routesBuilder.first);
								return;
							}
							if (data.user.role === USER_ROLES.seller) {
								navigate(routesBuilder.seller.home);
								return;
							}
							navigate(routesBuilder.first);
						},
						onError: (error) => {
							form.setError("root", {
								message: error.message,
							});
						},
					});
					return;
				}
				if (goal === USER_VERIFICATION_GOALS.login) {
					completeLoginMutation(undefined, {
						onSuccess: (data) => {
							if (data.user.role === USER_ROLES.customer) {
								navigate(routesBuilder.first);
								return;
							}
							if (data.user.role === USER_ROLES.seller) {
								navigate(routesBuilder.seller.home);
								return;
							}
							navigate(routesBuilder.first);
						},
						onError: (error) => {
							form.setError("root", {
								message: error.message,
							});
						},
					});
					return;
				}
				if (goal === USER_VERIFICATION_GOALS.passwordReset) {
					navigate(routesBuilder.newPassword);
					return;
				}
			},
			onError: (error) => {
				form.setError("root", {
					message: error.message,
				});
			},
		});
	});
	return (
		<>
			<CardHeader className="mb-5">
				<CardTitle className="text-2xl">User verification</CardTitle>
				<CardDescription>
					Entrez le code que vous avez reçu par mail.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{rootErrorMessage ? (
					<div className="mb-5">
						<Alert variant="destructive">
							<AlertDescription>{rootErrorMessage}</AlertDescription>
						</Alert>
					</div>
				) : null}
				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-8 mt-7">
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="email">Code</FormLabel>
										<FormControl>
											<Input placeholder="Entrez le code ici" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" isLoading={isLoading}>
								Continuer
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</>
	);
};

export { UserVerificationForm };
