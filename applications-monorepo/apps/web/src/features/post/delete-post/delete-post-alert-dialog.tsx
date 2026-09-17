import { useLocation, useNavigate } from "@tanstack/react-router";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import * as m from "@/paraglide/messages.js";
import type { Post } from "../common/post.ts";
import { useDeletePost } from "./use-delete-post.ts";

type DeletePostAlertDialogProps = {
	post: Post;
};

const DeletePostAlertDialog = create<DeletePostAlertDialogProps>(({ post }) => {
	const deletePost = useDeletePost();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<BaseAlertDialog
			title={m.post_delete_title()}
			description={m.post_delete_description()}
			confirmText={m.post_delete()}
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await deletePost.mutateAsync(post);
				if (location.pathname === `/posts/${post.id}`) {
					await navigate({ to: "/home" });
				}
			}}
		/>
	);
});

export { DeletePostAlertDialog };
