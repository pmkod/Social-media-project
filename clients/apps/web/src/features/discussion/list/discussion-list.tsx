import { RiChatNewLine, RiSearchLine } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/core/components/ui/empty.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { getDiscussionTitle } from "../common/discussion.utils.ts";
import { useDiscussions } from "../hooks/use-discussions.ts";
import { StartDiscussionModal } from "../start-discussion/start-discussion.modal.tsx";
import { DiscussionItem } from "./discussion-item.tsx";
import { DiscussionItemLoader } from "./discussion-item-loader.tsx";

type DiscussionListProps = {
	selectedDiscussionId?: string;
};

function DiscussionList({ selectedDiscussionId }: DiscussionListProps) {
	const [search, setSearch] = useState("");
	const discussionsQuery = useDiscussions();
	const { data: authenticatedUserData } = useAuthenticatedUser();
	const { ref: observerTargetRef, isIntersecting } = useIntersectionObserver({
		rootMargin: "160px",
	});
	const discussions =
		discussionsQuery.data?.pages.flatMap((page) => page.discussions) ?? [];
	const normalizedSearch = search.trim().toLocaleLowerCase();
	const filteredDiscussions = useMemo(() => {
		if (!normalizedSearch) return discussions;
		return discussions.filter((discussion) =>
			getDiscussionTitle(discussion, authenticatedUserData?.user.id)
				.toLocaleLowerCase()
				.includes(normalizedSearch),
		);
	}, [authenticatedUserData?.user.id, discussions, normalizedSearch]);

	useEffect(() => {
		if (
			!isIntersecting ||
			!discussionsQuery.hasNextPage ||
			discussionsQuery.isFetchingNextPage
		) {
			return;
		}
		void discussionsQuery.fetchNextPage();
	}, [
		discussionsQuery.fetchNextPage,
		discussionsQuery.hasNextPage,
		discussionsQuery.isFetchingNextPage,
		isIntersecting,
	]);

	const openStartDiscussionModal = () => {
		void NiceModal.show(StartDiscussionModal);
	};

	return (
		<>
			<header className="shrink-0 border-b border-border bg-background/95 px-4 pb-3 pt-4 backdrop-blur-md">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-xl font-bold tracking-tight">Messages</h1>
					<IconButton
						type="button"
						size="lg"
						aria-label="Start a new conversation"
						title="New conversation"
						onClick={openStartDiscussionModal}
					>
						<RiChatNewLine />
					</IconButton>
				</div>

				<label className="relative mt-4 block">
					<span className="sr-only">Search conversations</span>
					<RiSearchLine className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search conversations"
						className="h-10 w-full rounded-full border border-transparent bg-muted pl-10 pr-4 text-sm outline-none transition focus:border-foreground/30 focus:bg-background focus:ring-2 focus:ring-ring/30"
					/>
				</label>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
				{discussionsQuery.isLoading ? (
					<DiscussionItemLoader />
				) : discussionsQuery.isError ? (
					<ExceptionBlock
						borderless
						className="h-full min-h-72"
						title="Unable to load conversations"
						description="Your conversations could not be loaded. Check your connection and try again."
						onRefresh={() => void discussionsQuery.refetch()}
						isRefetching={discussionsQuery.isRefetching}
					/>
				) : discussions.length === 0 ? (
					<Empty className="h-full min-h-72 rounded-none">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<RiChatNewLine className="size-6" />
						</div>
						<EmptyHeader>
							<EmptyTitle>No conversations yet</EmptyTitle>
							<EmptyDescription>
								Start a private conversation or create a group to connect with
								people.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<button
								type="button"
								onClick={openStartDiscussionModal}
								className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
							>
								<RiChatNewLine className="size-4" />
								Start a conversation
							</button>
						</EmptyContent>
					</Empty>
				) : filteredDiscussions.length === 0 ? (
					<Empty className="h-full min-h-56 rounded-none py-8">
						<EmptyHeader>
							<EmptyTitle>No matching conversation</EmptyTitle>
							<EmptyDescription>
								Try another name or clear your search.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div>
						{filteredDiscussions.map((discussion) => (
							<DiscussionItem
								key={discussion.id}
								discussion={discussion}
								authenticatedUserId={authenticatedUserData?.user.id}
								isSelected={discussion.id === selectedDiscussionId}
							/>
						))}
						{discussionsQuery.hasNextPage && !normalizedSearch ? (
							<div ref={observerTargetRef}>
								<DiscussionItemLoader count={2} />
							</div>
						) : null}
					</div>
				)}
			</div>
		</>
	);
}

export { DiscussionList };
