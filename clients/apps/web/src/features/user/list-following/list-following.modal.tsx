import { useEffect, useRef } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import { useListFollowing } from "./use-list-following.ts";

type ListFollowingModalProps = {
	userId: string;
};

const ListFollowingModal = create(({ userId }: ListFollowingModalProps) => {
	const modal = useModal();
	const query = useListFollowing({ userId });
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
	const users = query.data?.pages.flatMap((page) => page.users) ?? [];

	const handleOpenChange = (open: boolean) => {
		if (!open) modal.remove();
	};

	useEffect(() => {
		const root = scrollContainerRef.current;
		const target = observerTargetRef.current;
		if (!root || !target || !modal.visible) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ root, rootMargin: "160px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [modal.visible, fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<Dialog open={modal.visible} onOpenChange={handleOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Following</DialogTitle>
				</DialogHeader>
				<DialogBody ref={scrollContainerRef}>
					{query.isLoading ? (
						<UserRowItemListLoader />
					) : query.isError ? (
						<ExceptionBlock
							title="Unable to load following"
							description="An error occurred while loading the following list."
							onRefresh={() => void query.refetch()}
							isRefetching={query.isRefetching}
							borderless
						/>
					) : users.length === 0 ? (
						<EmptyBlock
							title="No following users"
							description="Following users will appear here once this profile follows them."
							borderless
						/>
					) : (
						<div className="divide-y divide-border">
							{users.map((user) => (
								<UserRowItem
									key={user.id}
									user={user}
									onClick={() => modal.remove()}
								/>
							))}

							<div
								ref={observerTargetRef}
								className={query.isFetchingNextPage ? "h-16" : "h-1"}
							>
								{query.isFetchingNextPage ? (
									<UserRowItemListLoader count={1} />
								) : null}
							</div>
						</div>
					)}
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
});

export { ListFollowingModal };
