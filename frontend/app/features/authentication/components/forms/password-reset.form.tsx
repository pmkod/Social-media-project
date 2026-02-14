"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { passordResetValidationSchema } from "../../authentication.validation-schemas";
import { usePasswordReset } from "../../mutations/use-password-reset";
import { USER_VERIFICATION_GOALS } from "../../authentication.constants";
import { useNavigate } from "react-router";
import { routesBuilder } from "@/core/routes-builder";
import { Alert, AlertDescription } from "@/core/components/ui/alert";

const PasswordResetForm = () => {
	const { mutate, isPending } = usePasswordReset();
	const navigate = useNavigate();
	const form = useForm({
		resolver: zodResolver(passordResetValidationSchema),
		defaultValues: {
			email: "pierremariekod@gmail.com",
		},
	});

	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((values) => {
		mutate(values, {
			onSuccess: () => {
				navigate(
					routesBuilder.userVerification({
						goal: USER_VERIFICATION_GOALS.passwordReset,
					}),
				);
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
				<CardTitle className="text-2xl">Forgot Password</CardTitle>
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
							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="email">Email</FormLabel>
										<FormControl>
											<Input
												id="email"
												placeholder="johndoe@mail.com"
												type="email"
												autoComplete="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" fullWidth isLoading={isPending}>
								Send Reset Link
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</>
	);
};

export { PasswordResetForm };
