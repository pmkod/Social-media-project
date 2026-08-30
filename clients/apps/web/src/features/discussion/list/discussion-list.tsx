import { RiChatNewLine, RiGroup3Line } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
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
import { SearchInput } from "@/core/components/ui/search-input.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { getDiscussionTitle } from "../common/discussion.utils.ts";
import { CreateGroupDiscussionModal } from "../create-discussion/create-discussion.modal.tsx";
import { useDiscussions } from "../hooks/use-discussions.ts";
import { CreatePrivateDiscussionModal } from "../start-discussion/start-discussion.modal.tsx";
import { DiscussionItem } from "./discussion-item.tsx";
import { DiscussionListItemLoader } from "./discussion-list-item-loader.tsx";

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

	const openCreatePrivateDiscussionModal = () => {
		void NiceModal.show(CreatePrivateDiscussionModal);
	};

	const openCreateGroupDiscussionModal = () => {
		void NiceModal.show(CreateGroupDiscussionModal);
	};

	return (
		<>
			<header className="bg-background backdrop-blur-md">
				<div className="flex items-center justify-between gap-3 pl-3 pr-2 h-18">
					<h1 className="text-xl font-bold tracking-tight">Messages</h1>

					<div className="flex">
						<IconButton
							type="button"
							aria-label="Start a new conversation"
							title="New conversation"
							variant={"ghost"}
							onClick={openCreateGroupDiscussionModal}
						>
							<RiGroup3Line />
						</IconButton>
						<IconButton
							type="button"
							aria-label="Start a new conversation"
							title="New conversation"
							variant={"ghost"}
							onClick={openCreatePrivateDiscussionModal}
						>
							<RiChatNewLine />
						</IconButton>
					</div>
				</div>
				<div className="px-4 pb-2">
					<SearchInput
						label="Search conversations"
						size="lg"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search conversations"
					/>
				</div>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
				{discussionsQuery.isLoading ? (
					<DiscussionListItemLoader />
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
					<Empty>
						<EmptyHeader>
							<EmptyTitle>No conversations yet</EmptyTitle>
							<EmptyDescription>
								Start a private conversation or create a group to connect with
								people.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button type="button" onClick={openCreatePrivateDiscussionModal}>
								<RiChatNewLine className="size-4" />
								Start a conversation
							</Button>
						</EmptyContent>
					</Empty>
				) : filteredDiscussions.length === 0 ? (
					<Empty>
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
								<DiscussionListItemLoader count={2} />
							</div>
						) : null}
					</div>
				)}
			</div>
		</>
	);
}

export { DiscussionList };
