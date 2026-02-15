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
import { useNavigate } from "react-router";
import { CompleteSignupValidationSchema } from "../../authentication.validation-schemas";
import { useCompleteSignup } from "../../mutations/use-complete-signup";

const CompleteSignupForm = () => {
	const { mutate, isPending } = useCompleteSignup();

	const navigate = useNavigate();
	const form = useForm({
		resolver: zodResolver(CompleteSignupValidationSchema),
		defaultValues: {
			fullName: "Kodossou",
			username: "pmkod",
			password: "pierremariekod@gmail.com",
		},
	});
	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((data) => {
		mutate(data, {
			onSuccess: () => {
				navigate(routesBuilder.home);
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
								name="fullName"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel htmlFor="name">Full Name</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
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

							<Button type="submit" isLoading={isPending}>
								Complete signup
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</>
	);
};

export { CompleteSignupForm };
