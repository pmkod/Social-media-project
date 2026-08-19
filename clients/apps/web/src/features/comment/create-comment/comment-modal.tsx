import { RiCloseLine } from "@remixicon/react";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { CreateCommentForm } from "./create-comment-form.tsx";

export type CommentModalProps = {
	postId: string;
};

const CommentModal = create(({ postId }: CommentModalProps) => {
	const modal = useModal();

	if (!modal.visible) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-0 duration-200">
			<div
				className="absolute inset-0"
				onClick={() => modal.remove()}
				aria-hidden="true"
			/>
			<div className="relative w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl animate-in zoom-in-95 duration-200">
				<div className="flex items-center justify-between px-4 py-3 border-b border-border">
					<h2 className="text-base font-bold text-foreground">Reply</h2>
					<button
						type="button"
						onClick={() => modal.remove()}
						className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
						aria-label="Close"
					>
						<RiCloseLine className="h-5 w-5" />
					</button>
				</div>
				<CreateCommentForm postId={postId} onSuccess={() => modal.remove()} />
			</div>
		</div>
	);
});

export { CommentModal };
