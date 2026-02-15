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
import { Input } from "@/core/components/ui/input";
import { PasswordInput } from "@/core/components/ui/password-input";
import { routesBuilder } from "@/core/routes-builder";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { USER_VERIFICATION_GOALS } from "../../authentication.constants";
import { loginValidationSchema } from "../../authentication.validation-schemas";
import { useLogin } from "../../mutations/use-login";

function LoginForm() {
	const { mutate, isPending } = useLogin();

	const navigate = useNavigate();
	const form = useForm({
		resolver: zodResolver(loginValidationSchema),
		defaultValues: {
			email: "pierremariekod@gmail.com",
			password: "pierremariekod@gmail.com",
		},
	});

	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((data) => {
		mutate(data, {
			onSuccess: () => {
				navigate(
					routesBuilder.userVerification({
						goal: USER_VERIFICATION_GOALS.login,
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
				<CardTitle className="text-2xl">Login</CardTitle>
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
					<form onSubmit={onSubmit} className="space-y-8">
						<div className="grid gap-4">
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
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<div className="flex justify-between items-center">
											<FormLabel htmlFor="password">Password</FormLabel>
											<Link
												to="/password-reset"
												className="ml-auto inline-block text-sm underline"
											>
												Forgot your password?
											</Link>
										</div>
										<FormControl>
											<PasswordInput
												id="password"
												placeholder="******"
												autoComplete="current-password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" fullWidth isLoading={isPending}>
								Login
							</Button>
							{/* <Button variant="outline" className="w-full">
								Login with Google
							</Button> */}
						</div>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					Don&apos;t have an account?{" "}
					<Link to={routesBuilder.signup} className="underline">
						Sign up
					</Link>
				</div>
			</CardContent>
		</>
	);
}

export { LoginForm };
