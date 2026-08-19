import {
	RiAddLine,
	RiBookmarkLine,
	RiDeleteBinLine,
	RiFolder3Line,
	RiGlobalLine,
	RiLoader4Line,
	RiLockLine,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";
import { useAddPostToCollection } from "./use-add-post-to-collection.ts";
import { useBookmarkCollections } from "./use-bookmark-collections.ts";
import { useBookmarks } from "./use-bookmarks.ts";
import { useCreateBookmarkCollection } from "./use-create-bookmark-collection.ts";
import { useDeleteBookmarkCollection } from "./use-delete-bookmark-collection.ts";
import { useRemovePostFromCollection } from "./use-remove-post-from-collection.ts";

function CollectionOrganizer({
	postId,
	collections,
}: {
	postId: string;
	collections: BookmarkCollection[];
}) {
	const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "");
	const addPost = useAddPostToCollection();

	if (collections.length === 0) return null;

	return (
		<div className="flex items-center gap-2 border-x border-t border-border px-4 py-2 last:border-b">
			<select
				value={collectionId}
				onChange={(event) => setCollectionId(event.target.value)}
				aria-label="Choose a collection"
				className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-sky-500"
			>
				{collections.map((collection) => (
					<option key={collection.id} value={collection.id}>
						{collection.name}
					</option>
				))}
			</select>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={!collectionId || addPost.isPending}
				onClick={() => addPost.mutate({ collectionId, postId })}
			>
				<RiAddLine className="size-4" />
				Add
			</Button>
		</div>
	);
}

export function BookmarkList() {
	const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const collectionsQuery = useBookmarkCollections();
	const bookmarksQuery = useBookmarks({ collectionId: selectedCollectionId });
	const createCollection = useCreateBookmarkCollection();
	const deleteCollection = useDeleteBookmarkCollection();
	const removeFromCollection = useRemovePostFromCollection();

	const collections = collectionsQuery.data?.collections ?? [];
	const selectedCollection = collections.find(
		(collection) => collection.id === selectedCollectionId,
	);
	const posts = bookmarksQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	useEffect(() => {
		const target = observerTargetRef.current;
		if (!target) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					bookmarksQuery.hasNextPage &&
					!bookmarksQuery.isFetchingNextPage
				) {
					bookmarksQuery.fetchNextPage();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [
		bookmarksQuery.fetchNextPage,
		bookmarksQuery.hasNextPage,
		bookmarksQuery.isFetchingNextPage,
	]);

	const handleCreateCollection = (event: React.FormEvent) => {
		event.preventDefault();
		if (!name.trim() || createCollection.isPending) return;
		createCollection.mutate(
			{
				name: name.trim(),
				description: description.trim() || undefined,
				isPublic,
			},
			{
				onSuccess: (collection) => {
					setName("");
					setDescription("");
					setIsPublic(false);
					setIsCreateFormOpen(false);
					setSelectedCollectionId(collection.id);
				},
			},
		);
	};

	return (
		<div className="min-h-screen border-x border-border">
			<header className="sticky top-0 z-20 border-b border-border bg-background/90 p-4 backdrop-blur-xl">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
							<RiBookmarkLine className="size-6 text-amber-500" />
							Bookmarks
						</h1>
						<p className="mt-1 text-xs text-muted-foreground">
							Find and organize your saved posts.
						</p>
					</div>
					<Button
						type="button"
						size="sm"
						onClick={() => setIsCreateFormOpen((open) => !open)}
					>
						<RiAddLine className="size-4" />
						Collection
					</Button>
				</div>

				{isCreateFormOpen ? (
					<form
						onSubmit={handleCreateCollection}
						className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/30 p-4"
					>
						<input
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Collection name"
							maxLength={60}
							className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-sky-500"
						/>
						<textarea
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Description (optional)"
							maxLength={280}
							rows={2}
							className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500"
						/>
						<div className="flex items-center justify-between gap-3">
							<label className="flex items-center gap-2 text-xs text-muted-foreground">
								<input
									type="checkbox"
									checked={isPublic}
									onChange={(event) => setIsPublic(event.target.checked)}
								/>
								Show collection on my profile
							</label>
							<Button type="submit" size="sm" disabled={!name.trim()}>
								Create
							</Button>
						</div>
					</form>
				) : null}
			</header>

			<section className="border-b border-border p-4">
				<h2 className="mb-3 text-sm font-semibold text-foreground">
					Collections
				</h2>
				<div className="flex gap-2 overflow-x-auto pb-1">
					<button
						type="button"
						onClick={() => setSelectedCollectionId(undefined)}
						className={`min-w-32 rounded-xl border p-3 text-left transition ${
							selectedCollectionId
								? "border-border hover:bg-muted/50"
								: "border-sky-500 bg-sky-500/10"
						}`}
					>
						<RiBookmarkLine className="mb-3 size-5 text-amber-500" />
						<span className="block text-sm font-semibold text-foreground">
							All
						</span>
					</button>

					{collectionsQuery.isLoading ? (
						<RiLoader4Line className="m-6 size-5 animate-spin text-sky-500" />
					) : (
						collections.map((collection) => (
							<button
								type="button"
								key={collection.id}
								onClick={() => setSelectedCollectionId(collection.id)}
								className={`min-w-40 rounded-xl border p-3 text-left transition ${
									selectedCollectionId === collection.id
										? "border-sky-500 bg-sky-500/10"
										: "border-border hover:bg-muted/50"
								}`}
							>
								<div className="mb-3 flex items-center justify-between">
									<RiFolder3Line className="size-5 text-sky-500" />
									{collection.isPublic ? (
										<RiGlobalLine className="size-4 text-muted-foreground" />
									) : (
										<RiLockLine className="size-4 text-muted-foreground" />
									)}
								</div>
								<span className="block truncate text-sm font-semibold text-foreground">
									{collection.name}
								</span>
								<span className="text-xs text-muted-foreground">
									{collection.bookmarksCount} post
									{collection.bookmarksCount > 1 ? "s" : ""}
								</span>
							</button>
						))
					)}
				</div>
			</section>

			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<h2 className="font-semibold text-foreground">
					{selectedCollection?.name ?? "All bookmarks"}
				</h2>
				{selectedCollection ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-rose-500 hover:text-rose-600"
						disabled={deleteCollection.isPending}
						onClick={() => {
							if (window.confirm("Delete this collection?")) {
								deleteCollection.mutate(selectedCollection.id, {
									onSuccess: () => setSelectedCollectionId(undefined),
								});
							}
						}}
					>
						<RiDeleteBinLine className="size-4" />
						Delete
					</Button>
				) : null}
			</div>

			{bookmarksQuery.isLoading ? (
				<PostListLoader />
			) : bookmarksQuery.isError ? (
				<ExceptionBlock
					title="Unable to load your bookmarks"
					description="An error occurred while loading your saved posts."
					onRefresh={() => void bookmarksQuery.refetch()}
				/>
			) : posts.length === 0 ? (
				<EmptyBlock
					title="No saved posts"
					description="Use the bookmark icon below a post to find it here."
				/>
			) : (
				<div>
					{posts.map((post) => (
						<div key={post.id}>
							<PostItem post={post} />
							{selectedCollection ? (
								<div className="flex justify-end border-x border-t border-border px-4 py-2 last:border-b">
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={removeFromCollection.isPending}
										onClick={() =>
											removeFromCollection.mutate({
												collectionId: selectedCollection.id,
												postId: post.id,
											})
										}
									>
										Remove from collection
									</Button>
								</div>
							) : (
								<CollectionOrganizer
									postId={post.id}
									collections={collections}
								/>
							)}
						</div>
					))}
					<div ref={observerTargetRef}>
						{bookmarksQuery.hasNextPage ? <PostListLoader count={2} /> : null}
					</div>
				</div>
			)}
		</div>
	);
}
