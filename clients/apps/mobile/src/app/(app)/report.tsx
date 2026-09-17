import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react-native";
import { useReportReasons } from "@/features/report-reason/use-report-reasons";
import { useCreateReport } from "@/features/report/use-create-report";

export default function ReportScreen() {
	const router = useRouter();
	const { postId, commentId, userId, discussionId } = useLocalSearchParams<{
		postId?: string;
		commentId?: string;
		userId?: string;
		discussionId?: string;
	}>();

	const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
	const [reasonText, setReasonText] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data: reasonsData, isLoading: isReasonsLoading } = useReportReasons();
	const createReport = useCreateReport();

	const reasons = reasonsData?.reasons ?? [];

	const handleSubmit = async () => {
		if (!selectedReasonId && !reasonText.trim()) {
			setError("Please select a reason or describe the issue.");
			return;
		}

		setError(null);
		try {
			await createReport.mutateAsync({
				reasonId: selectedReasonId || undefined,
				reasonText: reasonText.trim() || undefined,
				postId,
				commentId,
				userId,
				discussionId,
			});
			setIsSuccess(true);
		} catch (err: any) {
			setError(err?.message || "Failed to submit report. Please try again.");
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
					Report
				</Text>
			</View>

			<ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
				{isSuccess ? (
					<View className="items-center py-12 px-4 rounded-2xl border border-[#27272a] bg-[#18181b]">
						<CheckCircle2 size={48} color="#10b981" />
						<Text className="text-lg font-bold text-foreground mt-4 text-center">
							Thank you for letting us know
						</Text>
						<Text className="text-sm text-muted-foreground text-center mt-2 max-w-xs leading-relaxed">
							Your report has been submitted. We review reports carefully to keep our community safe.
						</Text>
						<Pressable
							onPress={() => router.back()}
							className="mt-6 rounded-full bg-primary px-8 py-2.5 active:opacity-80"
						>
							<Text className="text-sm font-bold text-white">Done</Text>
						</Pressable>
					</View>
				) : (
					<View className="gap-5">
						<View className="flex-row items-center gap-3">
							<ShieldAlert size={22} color="#bc243c" />
							<Text className="text-base font-bold text-foreground">
								What would you like to report?
							</Text>
						</View>

						{error ? (
							<View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3">
								<Text className="text-xs text-destructive">{error}</Text>
							</View>
						) : null}

						{/* Reasons List */}
						{isReasonsLoading ? (
							<View className="py-8 items-center">
								<ActivityIndicator size="small" color="#bc243c" />
							</View>
						) : (
							<View className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]">
								{reasons.map((reason, index) => {
									const isSelected = selectedReasonId === reason.id;
									return (
										<Pressable
											key={reason.id}
											onPress={() => setSelectedReasonId(reason.id)}
											className={`flex-row items-center justify-between p-4 active:bg-[#27272a]/50 ${
												index < reasons.length - 1
													? "border-b border-[#27272a]"
													: ""
											} ${isSelected ? "bg-[#27272a]/40" : ""}`}
										>
											<View className="flex-1 mr-3">
												<Text className="text-sm font-semibold text-foreground">
													{reason.name}
												</Text>
												{reason.description ? (
													<Text className="text-xs text-muted-foreground mt-0.5">
														{reason.description}
													</Text>
												) : null}
											</View>
											<View
												className={`h-5 w-5 rounded-full border items-center justify-center ${
													isSelected
														? "border-primary bg-primary"
														: "border-[#3f3f46]"
												}`}
											>
												{isSelected && (
													<View className="h-2 w-2 rounded-full bg-white" />
												)}
											</View>
										</Pressable>
									);
								})}
							</View>
						)}

						{/* Additional Details */}
						<View>
							<Text className="text-xs font-semibold text-foreground mb-1.5">
								Additional Information (Optional)
							</Text>
							<TextInput
								value={reasonText}
								onChangeText={setReasonText}
								placeholder="Provide any additional context that can help us investigate..."
								placeholderTextColor="#71717a"
								multiline
								numberOfLines={3}
								textAlignVertical="top"
								className="min-h-[80px] rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
							/>
						</View>

						<Pressable
							onPress={handleSubmit}
							disabled={createReport.isPending}
							className="rounded-xl bg-primary py-3.5 items-center justify-center active:opacity-80"
						>
							{createReport.isPending ? (
								<ActivityIndicator size="small" color="#ffffff" />
							) : (
								<Text className="text-sm font-bold text-white">
									Submit Report
								</Text>
							)}
						</Pressable>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
