import {
	RiArrowLeftLine,
	RiFolder3Line,
	RiGlobalLine,
	RiLoader4Line,
	RiLockLine,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useBookmarkCollections } from "@/features/bookmark/use-bookmark-collections.ts";
import { useBookmarks } from "@/features/bookmark/use-bookmarks.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";

export function ProfileCollections({ userId }: { userId: string }) {
	const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const query = useBookmarkCollections(userId);
	const postsQuery = useBookmarks(selectedCollectionId, {
		enabled: Boolean(selectedCollectionId),
	});
	const selectedCollection = query.data?.collections.find(
		(collection) => collection.id === selectedCollectionId,
	);
	const posts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	useEffect(() => {
		const target = observerTargetRef.current;
		if (!target || !selectedCollectionId) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					postsQuery.hasNextPage &&
					!postsQuery.isFetchingNextPage
				) {
					postsQuery.fetchNextPage();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [
		selectedCollectionId,
		postsQuery.fetchNextPage,
		postsQuery.hasNextPage,
		postsQuery.isFetchingNextPage,
	]);

	if (query.isLoading) {
		return (
			<div className="flex justify-center p-12">
				<RiLoader4Line className="size-6 animate-spin text-sky-500" />
			</div>
		);
	}

	if (query.isError) {
		return (
			<ExceptionBlock
				title="Impossible de charger les collections"
				description="Une erreur s'est produite pendant le chargement des collections."
				onRefresh={() => void query.refetch()}
			/>
		);
	}

	const collections = query.data?.collections ?? [];
	if (selectedCollection) {
		return (
			<div>
				<div className="flex items-center gap-3 border-b border-border p-4">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setSelectedCollectionId(undefined)}
						aria-label="Retour aux collections"
					>
						<RiArrowLeftLine className="size-5" />
					</Button>
					<div className="min-w-0">
						<h3 className="truncate font-bold text-foreground">
							{selectedCollection.name}
						</h3>
						<p className="text-xs text-muted-foreground">
							{selectedCollection.bookmarksCount} publication
							{selectedCollection.bookmarksCount > 1 ? "s" : ""}
						</p>
					</div>
				</div>

				{postsQuery.isLoading ? (
					<PostListLoader />
				) : postsQuery.isError ? (
					<ExceptionBlock
						title="Impossible de charger cette collection"
						description="Une erreur s'est produite pendant le chargement des publications."
						onRefresh={() => void postsQuery.refetch()}
					/>
				) : posts.length === 0 ? (
					<EmptyBlock
						title="Cette collection est vide"
						description="Les publications ajoutées à cette collection apparaîtront ici."
					/>
				) : (
					<div>
						{posts.map((post) => (
							<PostItem key={post.id} post={post} />
						))}
						<div ref={observerTargetRef}>
							{postsQuery.hasNextPage ? <PostListLoader count={2} /> : null}
						</div>
					</div>
				)}
			</div>
		);
	}

	if (collections.length === 0) {
		return (
			<EmptyBlock
				title="Aucune collection visible"
				description="Les collections publiques de cet utilisateur apparaîtront ici."
			/>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
			{collections.map((collection) => (
				<button
					type="button"
					key={collection.id}
					onClick={() => setSelectedCollectionId(collection.id)}
					className="flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-gradient-to-br from-muted/80 to-background p-4 text-left transition hover:border-sky-500 hover:bg-muted"
				>
					<div className="flex items-center justify-between">
						<RiFolder3Line className="size-7 text-sky-500" />
						{collection.isPublic ? (
							<RiGlobalLine className="size-4 text-muted-foreground" />
						) : (
							<RiLockLine className="size-4 text-muted-foreground" />
						)}
					</div>
					<div>
						<h3 className="truncate font-semibold text-foreground">
							{collection.name}
						</h3>
						<p className="text-xs text-muted-foreground">
							{collection.bookmarksCount} publication
							{collection.bookmarksCount > 1 ? "s" : ""}
						</p>
					</div>
				</button>
			))}
		</div>
	);
}
