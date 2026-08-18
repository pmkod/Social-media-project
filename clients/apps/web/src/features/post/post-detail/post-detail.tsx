import { RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import {
	CommentItem,
	CommentListLoader,
	CreateCommentForm,
	useComments,
} from "@/features/comment";
import { PostItemLoader } from "../common/components/loaders/post-item-loader.tsx";
import { PostItem } from "../common/post-item.tsx";
import { usePost } from "./use-post";

type PostDetailProps = {
	postId: string;
	autoFocusComment?: boolean;
};

export function PostDetail({ postId, autoFocusComment }: PostDetailProps) {
	const { data: post, isLoading, isError } = usePost(postId);
	const {
		data: commentsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isCommentsLoading,
	} = useComments(postId, Boolean(post));

	if (isLoading) {
		return <PostItemLoader hasMedia={true} />;
	}

	if (isError || !post) {
		return (
			<div className="p-8 text-center space-y-4">
				<p className="text-rose-500 text-sm">
					Publication introuvable ou erreur de chargement.
				</p>
				<Link
					to="/home"
					className="inline-flex items-center gap-2 text-sky-500 hover:underline text-sm font-medium"
				>
					<RiArrowLeftLine className="h-4 w-4" />
					<span>Retour au flux</span>
				</Link>
			</div>
		);
	}

	const commentsCount = post.commentsCount ?? 0;

	const allComments = commentsData?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div>
			{/* Top Header */}
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<AppHeaderTitle>Post</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div>
				<PostItem post={post} />
				<div className="px-4 py-3 border-x border-y">
					{/* Add Comment Form */}
					<CreateCommentForm postId={post.id} autoFocus={autoFocusComment} />
				</div>
			</div>

			{/* Comments Section */}
			<section className="border-b border-border">
				<h3 className="px-4 py-3 text-sm font-semibold text-foreground border-b border-border">
					Commentaires ({commentsCount})
				</h3>

				{isCommentsLoading ? (
					<CommentListLoader count={3} />
				) : allComments.length === 0 ? (
					<EmptyBlock
						title="Aucun commentaire pour le moment"
						description="Soyez le premier à partager votre avis sur cette publication."
					/>
				) : (
					<div>
						{allComments.map((comment) => (
							<CommentItem key={comment.id} comment={comment} />
						))}

						{hasNextPage ? (
							<div className="p-4 flex justify-center">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
								>
									{isFetchingNextPage ? (
										<RiLoader4Line className="h-4 w-4 animate-spin" />
									) : null}
									<span>
										{isFetchingNextPage
											? "Chargement..."
											: "Voir plus de commentaires"}
									</span>
								</Button>
							</div>
						) : null}
					</div>
				)}
			</section>
		</div>
	);
}
