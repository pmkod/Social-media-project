import { useForm, useSelector } from "@tanstack/react-form";
import { CheckCircle2Icon } from "lucide-react";
import { useMemo, useState } from "react";
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
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import type { ReportReason, ReportTargetInput } from "./common/report.ts";
import { ReportReasonItem } from "./common/report-reason-item.tsx";
import { ReportReasonItemLoader } from "./common/report-reason-item-loader.tsx";
import { useCreateReport } from "./use-create-report.ts";
import { useReportReasons } from "./use-report-reasons.ts";

type ReportModalProps = ReportTargetInput;

type ReportFormValues = {
	reasonId: string;
	reasonText: string;
};

const OtherReasonId = "__other_report_reason__";

const reportSchema = z
	.object({
		reasonId: z.string().min(1, "Select a reason."),
		reasonText: z
			.string()
			.max(280, "The custom reason must be 280 characters or less."),
	})
	.superRefine((value, context) => {
		if (value.reasonId === OtherReasonId && !value.reasonText.trim()) {
			context.addIssue({
				code: "custom",
				path: ["reasonText"],
				message: "Tell us what happened.",
			});
		}
	});

const isOtherReason = (reason: Pick<ReportReason, "name">) =>
	["other", "autre"].includes(reason.name.trim().toLocaleLowerCase());

const getReportSubject = (target: ReportTargetInput) => {
	if (target.postId) return "post";
	if (target.commentId) return "comment";
	return "account";
};

const ReportModal = create<ReportModalProps>((target) => {
	const modal = useModal();
	const reportReasonsQuery = useReportReasons();
	const createReport = useCreateReport();
	const [isSubmitted, setIsSubmitted] = useState(false);
	const subject = getReportSubject(target);

	const form = useForm({
		defaultValues: {
			reasonId: "",
			reasonText: "",
		} satisfies ReportFormValues,
		validators: {
			onSubmit: reportSchema,
		},
		onSubmit: async ({ value }) => {
			if (createReport.isPending) return;

			try {
				await createReport.mutateAsync({
					...target,
					reasonId:
						value.reasonId === OtherReasonId ? undefined : value.reasonId,
					reasonText:
						value.reasonId === OtherReasonId
							? value.reasonText.trim()
							: undefined,
				});
				setIsSubmitted(true);
			} catch {
				// Keep the mutation error visible so the user can retry.
			}
		},
	});

	const selectedReasonId = useSelector(
		form.store,
		(state) => state.values.reasonId,
	);
	const reportReasons = useMemo(() => {
		const reasons = reportReasonsQuery.data?.reportReasons ?? [];
		if (reasons.length === 0) return [];

		const configuredOtherReason = reasons.find(isOtherReason);
		const listedReasons = reasons
			.filter((reason) => !isOtherReason(reason))
			.sort((first, second) => first.name.localeCompare(second.name));

		return [
			...listedReasons,
			{
				id: OtherReasonId,
				name: configuredOtherReason?.name ?? "Other",
				description:
					configuredOtherReason?.description ??
					"Something else that is not covered by these options.",
			},
		];
	}, [reportReasonsQuery.data?.reportReasons]);

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
							Thank you. We will review this {subject} and take action if it
							violates our rules.
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="flex items-center gap-3 px-5 py-6">
						<CheckCircle2Icon className="size-8 shrink-0 text-emerald-500" />
						<p className="text-sm text-muted-foreground">
							Your report has been recorded and will be reviewed.
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

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Report {subject}</DialogTitle>
					<DialogDescription>
						Why are you reporting this {subject}? Your report is private and is
						not shared with the author.
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
					<DialogBody className="px-0 py-0">
						{reportReasonsQuery.isLoading ? (
							<output className="block">
								<span className="sr-only">Loading report reasons</span>
								{Array.from({ length: 5 }).map((_, index) => (
									<ReportReasonItemLoader
										// biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholders.
										key={index}
									/>
								))}
							</output>
						) : reportReasonsQuery.isError ? (
							<ExceptionBlock
								title="Report reasons could not be loaded"
								description="Check your connection and try again."
								onRefresh={() => reportReasonsQuery.refetch()}
								isRefetching={reportReasonsQuery.isRefetching}
								borderless
								className="min-h-64"
							/>
						) : reportReasons.length === 0 ? (
							<EmptyBlock
								title="No report reasons available"
								description="Reporting is temporarily unavailable. Please try again later."
								onRefresh={() => reportReasonsQuery.refetch()}
								isRefetching={reportReasonsQuery.isRefetching}
								borderless
								className="min-h-64"
							/>
						) : (
							<form.Field name="reasonId">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel className="sr-only">Report reason</FieldLabel>
										<div role="radiogroup" aria-label="Report reason">
											{reportReasons.map((reason) => (
												<ReportReasonItem
													key={reason.id}
													reason={reason}
													isSelected={selectedReasonId === reason.id}
													disabled={createReport.isPending}
													onSelect={(reasonId) => {
														field.handleChange(reasonId);
														if (reasonId !== OtherReasonId) {
															form.setFieldValue("reasonText", "");
														}
													}}
												/>
											))}
										</div>
										<FieldError
											className="px-5 py-2"
											errors={field.state.meta.errors}
										/>
									</Field>
								)}
							</form.Field>
						)}

						{selectedReasonId === OtherReasonId ? (
							<div className="border-t border-border px-5 py-4">
								<form.Field name="reasonText">
									{(field) => (
										<Field data-invalid={!field.state.meta.isValid}>
											<FieldLabel htmlFor={field.name}>
												Tell us what happened
											</FieldLabel>
											<Textarea
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder="Describe the issue…"
												maxLength={280}
												rows={4}
												disabled={createReport.isPending}
												aria-invalid={!field.state.meta.isValid}
												autoFocus
											/>
											<FieldDescription className="text-right">
												{field.state.value.length}/280
											</FieldDescription>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</div>
						) : null}

						{createReport.error ? (
							<div className="border-t border-border px-5 py-3">
								<ExceptionBlock
									title="Report could not be sent"
									description={
										createReport.error.message ||
										"Please check your connection and try again."
									}
									borderless
									className="min-h-0 py-2"
								/>
							</div>
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
										!selectedReasonId ||
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

export { ReportModal };
