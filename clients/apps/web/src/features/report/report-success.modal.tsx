import { RiCheckboxCircleLine } from "@remixicon/react";
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
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";

const ReportSuccessModal = create(() => {
	const modal = useModal();

	const close = () => {
		modal.resolve();
		modal.remove();
	};

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
						Thank you. We will make review and take action if it violates our
						rules.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex items-center gap-3 px-5 py-6">
					<RiCheckboxCircleLine className="size-8 shrink-0 text-emerald-500" />
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
});

export { ReportSuccessModal };
