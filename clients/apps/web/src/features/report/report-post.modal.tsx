import { useForm, useSelector } from "@tanstack/react-form";
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/components/ui/select.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { useCreateReport } from "./use-create-report.ts";
import { useReportReasons } from "./use-report-reasons.ts";

type ReportPostModalProps = {
	postId: string;
};

type ReportPostFormValues = {
	reasonId: string;
	reasonText: string;
	description: string;
};

const reportPostSchema = z
	.object({
		reasonId: z.string().min(1, "Select a reason."),
		reasonText: z
			.string()
			.max(280, "The custom reason must be 280 characters or less."),
		description: z
			.string()
			.max(2000, "The description must be 2,000 characters or less."),
	})
	.superRefine((value, context) => {
		if (value.reasonId === "report_reason_other" && !value.reasonText.trim()) {
			context.addIssue({
				code: "custom",
				path: ["reasonText"],
				message: "Specify the reason.",
			});
		}
	});

const ReportPostModal = create<ReportPostModalProps>(({ postId }) => {
	const modal = useModal();
	const reportReasonsQuery = useReportReasons();
	const createReport = useCreateReport();
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm({
		defaultValues: {
			reasonId: "",
			reasonText: "",
			description: "",
		} satisfies ReportPostFormValues,
		validators: {
			onSubmit: reportPostSchema,
		},
		onSubmit: async ({ value }) => {
			if (createReport.isPending) return;

			try {
				await createReport.mutateAsync({
					targetType: "post",
					targetId: postId,
					reasonId: value.reasonId,
					reasonText: value.reasonText.trim() || undefined,
					description: value.description.trim() || undefined,
				});
				setIsSubmitted(true);
			} catch {
				// The mutation error stays visible so the user can retry.
			}
		},
	});

	const selectedReasonId = useSelector(
		form.store,
		(state) => state.values.reasonId,
	);
	const selectedReason = reportReasonsQuery.data?.reportReasons.find(
		(reason) => reason.id === selectedReasonId,
	);
	const isOtherReason = ["other", "autre"].includes(
		selectedReason?.name.trim().toLocaleLowerCase() ?? "",
	);

	const close = () => {
		if (createReport.isPending) return;
		modal.resolve();
		modal.remove();
	};

	if (isSubmitted) {
		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				<DialogContent size="md">
					<DialogHeader>
						<DialogTitle>Report submitted</DialogTitle>
						<DialogDescription>
							Thank you. We will review this post and take action if it violates
							our rules.
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="flex items-center gap-3 px-5 py-6">
						<CheckCircle2Icon className="size-8 shrink-0 text-emerald-500" />
						<p className="text-sm text-muted-foreground">
							Your report has been recorded with a pending status.
						</p>
					</DialogBody>
					<DialogFooter>
						<Button type="button" onClick={close}>
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	const reportReasons = reportReasonsQuery.data?.reportReasons ?? [];
	const mutationError = createReport.error;

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Report post</DialogTitle>
					<DialogDescription>
						Tell us why this post should be reviewed. Your report is not shared
						with the post author.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					onChange={() => {
						if (createReport.isError) createReport.reset();
					}}
					className="flex min-h-0 flex-1 flex-col"
				>
					<DialogBody className="px-5 py-5">
						<FieldGroup className="gap-5">
							<form.Field name="reasonId">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>Reason</FieldLabel>
										<Select
											value={field.state.value || undefined}
											onValueChange={field.handleChange}
											disabled={
												reportReasonsQuery.isLoading || createReport.isPending
											}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={!field.state.meta.isValid}
											>
												<SelectValue
													placeholder={
														reportReasonsQuery.isLoading
															? "Loading reasons…"
															: "Select a reason"
													}
												/>
											</SelectTrigger>
											<SelectContent position="popper">
												{reportReasons.map((reason) => (
													<SelectItem key={reason.id} value={reason.id}>
														{reason.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{selectedReason?.description ? (
											<FieldDescription>
												{selectedReason.description}
											</FieldDescription>
										) : null}
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							{isOtherReason ? (
								<form.Field name="reasonText">
									{(field) => (
										<Field data-invalid={!field.state.meta.isValid}>
											<FieldLabel htmlFor={field.name}>
												Specify the reason
											</FieldLabel>
											<Textarea
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder="What is the issue?"
												maxLength={280}
												rows={2}
												disabled={createReport.isPending}
												aria-invalid={!field.state.meta.isValid}
											/>
											<FieldDescription className="text-right">
												{field.state.value.length}/280
											</FieldDescription>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							) : null}

							<form.Field name="description">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>
											Additional details (optional)
										</FieldLabel>
										<Textarea
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											placeholder="Describe what happened and where to look."
											maxLength={2000}
											rows={4}
											disabled={createReport.isPending}
											aria-invalid={!field.state.meta.isValid}
										/>
										<FieldDescription className="text-right">
											{field.state.value.length}/2000
										</FieldDescription>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>
						</FieldGroup>

						{reportReasonsQuery.isError ? (
							<p className="mt-4 text-sm text-destructive" role="alert">
								Unable to load report reasons. Please try again.
							</p>
						) : null}
						{mutationError ? (
							<p className="mt-4 text-sm text-destructive" role="alert">
								{mutationError.message ||
									"Unable to submit your report. Please try again."}
							</p>
						) : null}
					</DialogBody>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={close}
							disabled={createReport.isPending}
						>
							Cancel
						</Button>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									colorScheme="destructive"
									disabled={
										isSubmitting ||
										createReport.isPending ||
										reportReasons.length === 0
									}
									isLoading={isSubmitting || createReport.isPending}
								>
									Submit report
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { ReportPostModal };
export type { ReportPostModalProps };
