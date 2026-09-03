import { RiAddLine, RiPlayCircleFill } from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { ChillzItem } from "@/features/chillz/chillz-item.tsx";
import { CreatePostForm } from "@/features/post/create-post/create-post-form.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";

export const Route = createFileRoute("/_main/chillz")({
	validateSearch: z.object({ q: z.string().trim().max(100).optional() }),
	component: ChillzPage,
});

function ChillzPage() {
	const { q = "" } = Route.useSearch();
	const navigate = Route.useNavigate();
	const feedRef = useRef<HTMLElement>(null);
	const [creating, setCreating] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const query = useSearchPosts({ query: q, type: "CHILLZ" });
	const { ref, isIntersecting } = useIntersectionObserver({
		rootMargin: "150px",
	});
	useEffect(() => {
		if (
			isIntersecting &&
			query.hasNextPage &&
			!query.isFetching &&
			!query.isFetchNextPageError
		)
			void query.fetchNextPage();
	}, [
		isIntersecting,
		query.hasNextPage,
		query.isFetching,
		query.isFetchNextPageError,
		query.fetchNextPage,
	]);
	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	return (
		<main className="min-w-0 flex-1 bg-muted/20 px-3 pb-20 md:px-6 md:pb-4">
			<header className="mx-auto flex max-w-3xl items-center justify-between gap-3 py-5">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-bold">
						<RiPlayCircleFill className="size-7 text-primary" />
						Chillz
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Your moments. Your vibe.
					</p>
				</div>
				<Button onClick={() => setCreating(true)}>
					<RiAddLine className="size-5" />
					<span>Create Chillz</span>
				</Button>
			</header>
			{q ? (
				<div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-2 text-sm">
					<p>Results for “{q}”</p>
					<Link to="/chillz" search={{}} className="text-primary">
						All Chillz
					</Link>
				</div>
			) : null}
			<section
				ref={feedRef}
				key={q}
				aria-label="Chillz feed. Scroll to see the next video."
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Allow keyboard scrolling of the feed.
				tabIndex={0}
				className="h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain snap-y snap-proximity rounded-2xl outline-offset-2 md:h-[calc(100dvh-8rem)]"
			>
				{query.isPending ? (
					<Skeleton className="mx-auto h-[65vh] w-full max-w-md rounded-2xl" />
				) : query.isError && !query.data ? (
					<ExceptionBlock
						title="Unable to load Chillz"
						description="Please try again."
						onRefresh={() => void query.refetch()}
						isRefetching={query.isRefetching}
					/>
				) : !posts.length ? (
					<EmptyBlock
						title={q ? "No Chillz found" : "Share your first Chillz"}
						description={
							q
								? "Try searching for another moment or topic."
								: "Share the first Chillz: a video of up to 90 seconds."
						}
					/>
				) : (
					posts.map((post) => (
						<div key={post.id} className="snap-start pb-6">
							<ChillzItem post={post} paused={creating} />
						</div>
					))
				)}
				{query.hasNextPage ? (
					<div ref={ref} className="flex justify-center py-6">
						<Button
							variant="outline"
							isLoading={query.isFetchingNextPage}
							onClick={() => void query.fetchNextPage()}
						>
							{query.isFetchNextPageError ? "Try again" : "More Chillz"}
						</Button>
					</div>
				) : posts.length ? (
					<p className="py-6 text-center text-sm text-muted-foreground">
						You're all caught up. Come back for more Chillz.
					</p>
				) : null}
			</section>
			<Dialog
				open={creating}
				onOpenChange={(open) => {
					if (!publishing) setCreating(open);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create a Chillz</DialogTitle>
						<DialogDescription>
							A little moment worth sharing.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<CreatePostForm
							onBusyChange={setPublishing}
							type="CHILLZ"
							onSuccess={() => {
								setCreating(false);
								feedRef.current?.scrollTo({ top: 0 });
								if (q) void navigate({ search: {} });
							}}
						/>
					</DialogBody>
				</DialogContent>
			</Dialog>
		</main>
	);
}
