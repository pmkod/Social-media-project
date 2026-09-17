import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react-native";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { useRequestEmailChange } from "@/features/user/change-email/use-request-email-change";
import { UserVerificationGoals } from "@/features/authentication/user-verification/user-verification-goal";

const changeEmailSchema = z.object({
	newEmail: z
		.string()
		.trim()
		.min(1, "Email is required.")
		.email("Please enter a valid email address."),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export default function ChangeEmailScreen() {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const user = authData?.user;

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const requestEmailChange = useRequestEmailChange();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ChangeEmailFormData>({
		resolver: zodResolver(changeEmailSchema),
		defaultValues: {
			newEmail: "",
		},
	});

	const onSubmit = async (values: ChangeEmailFormData) => {
		setServerError(null);
		try {
			await requestEmailChange.mutateAsync(values.newEmail);
			router.push({
				pathname: "/(auth)/user-verification" as any,
				params: { goal: UserVerificationGoals.emailChange },
			});
		} catch (err: any) {
			setServerError(err?.message || "Failed to request email change.");
		}
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-[#09090b]"
			>
				<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="ml-3 text-base font-bold text-foreground">
						Change Email
					</Text>
				</View>

			<ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
				<View className="mb-4 rounded-xl border border-[#27272a] bg-[#18181b] p-4">
					<Text className="text-xs text-muted-foreground">Current Email Address</Text>
					<Text className="text-sm font-semibold text-foreground mt-1">
						{user?.email || "Not set"}
					</Text>
				</View>

				<View className="gap-4">
					{serverError ? (
						<View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3">
							<Text className="text-xs text-destructive">{serverError}</Text>
						</View>
					) : null}

					<View>
						<Text className="text-xs font-semibold text-foreground mb-1.5">
							New Email Address
						</Text>
						<Controller
							control={control}
							name="newEmail"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="email-address"
									autoCapitalize="none"
									placeholder="Enter new email address"
									placeholderTextColor="#71717a"
									className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
								/>
							)}
						/>
						{errors.newEmail ? (
							<Text className="text-xs text-destructive mt-1">
								{errors.newEmail.message}
							</Text>
						) : null}
					</View>

					<Text className="text-xs text-muted-foreground leading-relaxed">
						We will send a verification code to your new email address to confirm ownership.
					</Text>

					<Pressable
						onPress={handleSubmit(onSubmit)}
						disabled={requestEmailChange.isPending}
						className="mt-4 rounded-xl bg-primary py-3.5 items-center justify-center active:opacity-80"
					>
						{requestEmailChange.isPending ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="text-sm font-bold text-white">
								Continue
							</Text>
						)}
					</Pressable>
				</View>
			</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
