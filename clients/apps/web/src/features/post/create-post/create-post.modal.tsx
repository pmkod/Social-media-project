import { useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { m } from "@/paraglide/messages.js";
import { CreatePostForm } from "./create-post-form.tsx";

const CreatePostModal = create(() => {
	const modal = useModal();
	const [isBusy, setIsBusy] = useState(false);

	const finish = () => {
		modal.resolve();
		modal.remove();
	};

	const close = () => {
		if (isBusy) return;
		finish();
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="xl">
				<DialogHeader>
					<DialogTitle>{m.action_post()}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<CreatePostForm
						onSuccess={finish}
						onBusyChange={setIsBusy}
						className="border-0 px-5 pt-5 md:rounded-none md:border-0"
					/>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
});

export { CreatePostModal };
