import { createFileRoute, Navigate } from "@tanstack/react-router";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { ChillzLoader } from "@/features/chillz/chillz-loader.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";

export const Route = createFileRoute("/_main/chillz/")({
	component: LatestChillzPage,
});

export function LatestChillzPage() {
	const query = useSearchPosts({ query: "", type: "CHILLZ" });
	const latestPost = query.data?.pages[0]?.posts[0];
	return (
		<main className="chillz-page">
			{query.isPending || query.isRefetching ? (
				<ChillzLoader />
			) : query.isError ? (
				<ExceptionBlock
					title="Unable to load Chillz"
					description="Please try again."
					onRefresh={() => void query.refetch()}
					isRefetching={query.isRefetching}
				/>
			) : latestPost ? (
				<>
					<ChillzLoader />
					<Navigate
						to="/chillz/$chillzId"
						params={{ chillzId: latestPost.id }}
						replace
					/>
				</>
			) : (
				<EmptyBlock
					title="Share your first Chillz"
					description="Share the first Chillz: a video of up to 90 seconds."
				/>
			)}
		</main>
	);
}
