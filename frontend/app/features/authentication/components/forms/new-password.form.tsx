"use client";

import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/core/components/ui/form";
import { PasswordInput } from "@/core/components/ui/password-input";
import { routesBuilder } from "@/core/routes-builder";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { newPasswordValidationSchema } from "../../authentication.validation-schemas";
import { useNewPassword } from "../../mutations/use-new-password";

function NewPasswordForm() {
	const { mutate, isPending } = useNewPassword();
	const navigate = useNavigate();

	const form = useForm({
		resolver: zodResolver(newPasswordValidationSchema),
		defaultValues: {
			newPassword: "",
			confirmNewPassword: "",
		},
	});
	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((values) => {
		if (values.newPassword !== values.confirmNewPassword) {
			form.setError("confirmNewPassword", {
				message: "Password don't match",
			});
			return;
		}
		mutate(
			{
				newPassword: values.newPassword,
			},
			{
				onSuccess: () => {
					navigate(routesBuilder.home);
				},
				onError: (error) => {
					form.setError("root", {
						message: error.message,
					});
				},
			},
		);
	});

	return (
		<>
			<CardHeader className="min-h-5">
				<CardTitle className="text-2xl">New password</CardTitle>
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
							{/* New Password Field */}
							<FormField
								control={form.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="password">New Password</FormLabel>
										<FormControl>
											<PasswordInput
												id="password"
												placeholder="******"
												autoComplete="new-password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Confirm Password Field */}
							<FormField
								control={form.control}
								name="confirmNewPassword"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="confirmPassword">
											Confirm Password
										</FormLabel>
										<FormControl>
											<PasswordInput
												id="confirmPassword"
												placeholder="******"
												autoComplete="new-password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" fullWidth isLoading={isPending}>
								Reset Password
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</>
	);
}

export { NewPasswordForm };
