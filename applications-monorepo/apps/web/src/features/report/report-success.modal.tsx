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
import * as m from "@/paraglide/messages.js";

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
					<DialogTitle>{m.report_success_title()}</DialogTitle>
					<DialogDescription>
						{m.report_success_description()}
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex items-center gap-3 px-5 py-6">
					<RiCheckboxCircleLine className="size-8 shrink-0 text-emerald-500" />
					<p className="text-sm text-muted-foreground">
						{m.report_success_recorded()}
					</p>
				</DialogBody>
				<DialogFooter>
					<Button type="button" onClick={close}>
						{m.action_done()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

export { ReportSuccessModal };
