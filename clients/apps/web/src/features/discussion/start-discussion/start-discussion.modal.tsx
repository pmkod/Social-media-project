import { RiGroupLine } from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import NiceModal, {
	create,
	useModal,
} from "@/core/components/ui/nice-modal.tsx";
import type { User } from "@/features/user/common/user.ts";
import { DiscussionUserPicker } from "../common/discussion-user-picker.tsx";
import { CreateDiscussionModal } from "../create-discussion/create-discussion.modal.tsx";
import { useCreateDiscussion } from "../hooks/use-create-discussion.ts";

const StartDiscussionModal = create(() => {
	const modal = useModal();
	const navigate = useNavigate();
	const createDiscussion = useCreateDiscussion();
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);

	const close = () => {
		if (createDiscussion.isPending) return;
		modal.resolve();
		modal.remove();
	};

	const startPrivateDiscussion = async (user: User) => {
		if (createDiscussion.isPending) return;
		setPendingUserId(user.id);
		try {
			const { discussion } = await createDiscussion.mutateAsync({
				type: "PRIVATE",
				memberIds: [user.id],
			});
			modal.resolve(discussion);
			modal.remove();
			await navigate({
				to: "/discussions/$discussionId",
				params: { discussionId: discussion.id },
			});
		} catch {
			setPendingUserId(null);
		}
	};

	const openCreateGroupModal = () => {
		close();
		window.setTimeout(() => {
			void NiceModal.show(CreateDiscussionModal);
		}, 0);
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="lg" className="h-[min(42rem,calc(100dvh-2rem))]">
				<DialogHeader>
					<DialogTitle>New message</DialogTitle>
					<DialogDescription>
						Choose someone to start a private conversation.
					</DialogDescription>
				</DialogHeader>

				<DialogBody className="flex min-h-0 flex-col overflow-hidden">
					<div className="shrink-0 px-5 pt-4">
						<Button
							type="button"
							variant="secondary"
							fullWidth
							className="h-11 justify-start rounded-xl"
							disabled={createDiscussion.isPending}
							onClick={openCreateGroupModal}
						>
							<span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
								<RiGroupLine className="size-4" />
							</span>
							Create a group conversation
						</Button>
					</div>

					<DiscussionUserPicker
						onSelect={(user) => void startPrivateDiscussion(user)}
						pendingUserId={pendingUserId}
						disabled={createDiscussion.isPending}
					/>

					{createDiscussion.isError ? (
						<p
							className="shrink-0 border-t border-border px-5 py-3 text-sm text-destructive"
							role="alert"
						>
							{createDiscussion.error instanceof Error &&
							createDiscussion.error.message
								? createDiscussion.error.message
								: "Unable to start this conversation."}
						</p>
					) : null}
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
});

export { StartDiscussionModal };
