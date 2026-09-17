import React, { useState } from "react";
import {
	View,
	Text,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { PasswordInput } from "@/core/components/ui/password-input";
import { useChangePassword } from "@/features/user/change-password/use-change-password";

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required."),
		newPassword: z
			.string()
			.min(8, "Password must be at least 8 characters.")
			.max(128, "Password must be at most 128 characters."),
		confirmPassword: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
	const router = useRouter();
	const changePassword = useChangePassword();

	const [isSuccess, setIsSuccess] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (values: ChangePasswordFormData) => {
		setServerError(null);
		try {
			await changePassword.mutateAsync({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			setIsSuccess(true);
			reset();
		} catch (err: any) {
			setServerError(err?.message || "Failed to change password. Please verify current password.");
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-[#09090b]"
		>
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<Text className="ml-3 text-base font-bold text-foreground">
					Change Password
				</Text>
			</View>

			<ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
				{isSuccess ? (
					<View className="items-center py-8 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
						<CheckCircle2 size={40} color="#10b981" />
						<Text className="text-base font-bold text-foreground mt-3">
							Password Changed!
						</Text>
						<Text className="text-xs text-muted-foreground text-center mt-1">
							Your password has been successfully updated.
						</Text>
						<Pressable
							onPress={() => router.back()}
							className="mt-5 rounded-full bg-primary px-6 py-2 active:opacity-80"
						>
							<Text className="text-xs font-bold text-white">Done</Text>
						</Pressable>
					</View>
				) : (
					<View className="gap-4">
						{serverError ? (
							<View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3">
								<Text className="text-xs text-destructive">{serverError}</Text>
							</View>
						) : null}

						<View>
							<Text className="text-xs font-semibold text-foreground mb-1.5">
								Current Password
							</Text>
							<Controller
								control={control}
								name="currentPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<PasswordInput
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										placeholder="Enter current password"
										placeholderTextColor="#71717a"
										className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
									/>
								)}
							/>
							{errors.currentPassword ? (
								<Text className="text-xs text-destructive mt-1">
									{errors.currentPassword.message}
								</Text>
							) : null}
						</View>

						<View>
							<Text className="text-xs font-semibold text-foreground mb-1.5">
								New Password
							</Text>
							<Controller
								control={control}
								name="newPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<PasswordInput
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										placeholder="Enter new password (min. 8 characters)"
										placeholderTextColor="#71717a"
										className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
									/>
								)}
							/>
							{errors.newPassword ? (
								<Text className="text-xs text-destructive mt-1">
									{errors.newPassword.message}
								</Text>
							) : null}
						</View>

						<View>
							<Text className="text-xs font-semibold text-foreground mb-1.5">
								Confirm New Password
							</Text>
							<Controller
								control={control}
								name="confirmPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<PasswordInput
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										placeholder="Confirm new password"
										placeholderTextColor="#71717a"
										className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
									/>
								)}
							/>
							{errors.confirmPassword ? (
								<Text className="text-xs text-destructive mt-1">
									{errors.confirmPassword.message}
								</Text>
							) : null}
						</View>

						<Pressable
							onPress={handleSubmit(onSubmit)}
							disabled={changePassword.isPending}
							className="mt-4 rounded-xl bg-primary py-3.5 items-center justify-center active:opacity-80"
						>
							{changePassword.isPending ? (
								<ActivityIndicator size="small" color="#ffffff" />
							) : (
								<Text className="text-sm font-bold text-white">
									Update Password
								</Text>
							)}
						</Pressable>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
