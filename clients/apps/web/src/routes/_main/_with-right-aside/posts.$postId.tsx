import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { PostComments } from "@/features/comment/post-comments.tsx";
import { PostItemLoader } from "@/features/post/common/components/loaders/post-item-loader.tsx";
import { PostItem } from "@/features/post/common/post-item.tsx";
import { usePost } from "@/features/post/post-detail/use-post";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/_with-right-aside/posts/$postId")({
	validateSearch: z.object({ focusComment: z.boolean().optional() }),
	component: PostDetailPage,
});

function PostDetailPage() {
	const { postId } = Route.useParams();
	const { focusComment } = Route.useSearch();
	const query = usePost({ postId });
	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<AppHeaderTitle>{m.post_detail_title()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			{query.isPending ? (
				<PostItemLoader hasMedia />
			) : query.isSuccess ? (
				<>
					<PostItem post={query.data.post} />
					<div>
						<PostComments
							key={postId}
							postId={postId}
							autoFocus={focusComment}
						/>
					</div>
				</>
			) : (
				<ExceptionBlock
					title="Unable to load post"
					description={getExceptionMessage(query.error)}
					onRefresh={() => void query.refetch()}
					isRefetching={query.isRefetching}
					className="h-120"
				/>
			)}
		</MainContainer>
	);
}
