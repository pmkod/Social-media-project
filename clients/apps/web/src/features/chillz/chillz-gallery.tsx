import { RiHeartLine, RiPlayCircleLine, RiPlayFill } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";
import { useUserPosts } from "@/features/post/user-posts/use-user-posts.ts";
import { chillzVideoUrl } from "./chillz-item.tsx";

function ChillzGallery({
	query,
	horizontal = false,
	emptyDescription,
}: {
	query: ReturnType<typeof useSearchPosts>;
	horizontal?: boolean;
	emptyDescription: string;
}) {
	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	if (query.isPending)
		return (
			<section
				aria-label="Loading Chillz"
				aria-busy="true"
				className="grid grid-cols-3 gap-2 p-4"
			>
				{[0, 1, 2].map((id) => (
					<Skeleton key={id} className="aspect-[9/16] rounded-xl" />
				))}
			</section>
		);
	if (query.isError && !query.data)
		return (
			<ExceptionBlock
				bordered={false}
				title="Unable to load Chillz"
				description="Please try again."
				onRefresh={() => void query.refetch()}
				isRefetching={query.isRefetching}
			/>
		);
	if (!posts.length)
		return (
			<EmptyBlock
				bordered={false}
				title="No Chillz yet"
				description={emptyDescription}
			/>
		);
	return (
		<>
			<div
				className={
					horizontal
						? "flex snap-x snap-mandatory gap-3 overflow-x-auto p-4"
						: "grid grid-cols-2 gap-3 p-4 sm:grid-cols-3"
				}
			>
				{posts.map((post) => (
					<Link
						key={post.id}
						to="/posts/$postId"
						params={{ postId: post.id }}
						aria-label={`Watch Chillz by ${post.author?.fullName ?? "creator"}: ${post.text || "video"}`}
						className={`group relative aspect-[9/16] overflow-hidden rounded-xl bg-muted focus-visible:outline-2 focus-visible:outline-primary ${horizontal ? "w-40 shrink-0 snap-start sm:w-44" : ""}`}
					>
						<video
							src={chillzVideoUrl(post)}
							muted
							playsInline
							preload="metadata"
							className="pointer-events-none h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />
						<RiPlayFill className="absolute left-3 top-3 size-5 text-white drop-shadow" />
						<div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3 text-white">
							<p className="line-clamp-2 break-words text-sm font-medium">
								{post.text || "Catch this Chillz"}
							</p>
							<p className="truncate text-xs text-white/80">
								@{post.author?.username ?? "creator"}
							</p>
							<span className="flex items-center gap-1 text-xs">
								<RiHeartLine className="size-3.5" />
								{post.likesCount ?? 0}
							</span>
						</div>
					</Link>
				))}
			</div>
			{!horizontal && query.hasNextPage ? (
				<div className="flex justify-center p-3">
					<Button
						variant="ghost"
						isLoading={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{query.isFetchNextPageError ? "Try again" : "More Chillz"}
					</Button>
				</div>
			) : null}
		</>
	);
}

export function ChillzSearchSection({ query }: { query: string }) {
	const chillz = useSearchPosts({ query, type: "CHILLZ" });
	return (
		<section
			aria-label="Chillz"
			className="mb-6 overflow-hidden rounded-xl border"
		>
			<header className="flex items-center justify-between gap-2 border-b px-4 py-3">
				<h2 className="flex items-center gap-2 font-semibold">
					<RiPlayCircleLine className="size-5 text-primary" />
					{query ? "Chillz" : "Discover Chillz"}
				</h2>
				<Link
					to="/chillz"
					search={query ? { q: query } : {}}
					className="text-sm font-medium text-primary"
				>
					See all
				</Link>
			</header>
			<ChillzGallery
				query={chillz}
				horizontal
				emptyDescription={
					query
						? `No Chillz match “${query}”. Try another search.`
						: "Short videos from the community will appear here."
				}
			/>
		</section>
	);
}

export function UserChillz({ userId }: { userId?: string }) {
	const query = useUserPosts({ userId: userId ?? "", type: "CHILLZ" });
	return (
		<div className="border-x border-t">
			<ChillzGallery
				query={query}
				emptyDescription="Chillz shared by this person will appear here."
			/>
		</div>
	);
}
