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
import { USER_ROLES } from "@/features/user/constants/user-roles.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { USER_VERIFICATION_GOALS } from "../../authentication.constants";
import { signupValidationSchema } from "../../authentication.validation-schemas";
import { useSignup } from "../../mutations/use-signup";

const SignupForm = () => {
	const { mutate, isPending } = useSignup();

	const navigate = useNavigate();
	const form = useForm({
		resolver: zodResolver(signupValidationSchema),
		defaultValues: {
			firstName: "Kodossou",
			lastName: "Kouassi",
			email: "pierremariekod@gmail.com",
			password: "pierremariekod@gmail.com",
		},
	});
	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((data) => {
		mutate(
			{
				...data,
				role: USER_ROLES.customer,
			},
			{
				onSuccess: () => {
					navigate(
						routesBuilder.userVerification({
							goal: USER_VERIFICATION_GOALS.signup,
						}),
					);
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
			<CardHeader className="mb-5">
				<CardTitle className="text-2xl">Sign up</CardTitle>
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
							{/* Name Field */}
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="name">First Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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

							{/* Password Field */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="password">Password</FormLabel>
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
							{/* <FormField
								control={form.control}
								name="confirmPassword"
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
							/> */}

							<Button type="submit" isLoading={isPending}>
								Register
							</Button>
						</div>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					Already have an account?{" "}
					<Link to="/" className="underline">
						Login
					</Link>
				</div>
			</CardContent>
		</>
	);
};

export { SignupForm };
