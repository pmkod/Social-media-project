import { useEffect, useState } from "react";
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
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import { useListFollowing } from "./use-list-following.ts";

type ListFollowingModalProps = {
	userId: string;
};

const ListFollowingModal = create(({ userId }: ListFollowingModalProps) => {
	const modal = useModal();
	const query = useListFollowing({ userId });
	const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
		null,
	);
	const { fetchNextPage, hasNextPage, isFetching } = query;

	const users = query.data?.pages.flatMap((page) => page.users) ?? [];

	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({
			root: scrollContainer,
			rootMargin: "100px",
		});

	const handleOpenChange = (open: boolean) => {
		if (!open) modal.remove();
	};

	const handleRefetch = () => query.refetch();

	useEffect(() => {
		if (!modal.visible || !isTargetIntersecting || !hasNextPage || isFetching)
			return;

		fetchNextPage();
	}, [
		modal.visible,
		isTargetIntersecting,
		hasNextPage,
		isFetching,
		fetchNextPage,
	]);

	return (
		<Dialog open={modal.visible} onOpenChange={handleOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Following</DialogTitle>
				</DialogHeader>
				<DialogBody ref={setScrollContainer}>
					<div className="h-150">
						{query.isLoading ? (
							<UserRowItemListLoader />
						) : query.isError ? (
							<ExceptionBlock
								title="Unable to load following"
								description="An error occurred while loading the following list."
								onRefresh={handleRefetch}
								isRefetching={query.isRefetching}
								bordered={false}
							/>
						) : users.length === 0 ? (
							<EmptyBlock
								title="No following users"
								description="Following users will appear here once this profile follows them."
								bordered={false}
							/>
						) : (
							<div className="divide-y divide-border">
								{users.map((user) => (
									<UserRowItem key={user.id} user={user} />
								))}

								{query.hasNextPage ? (
									<div ref={observerTargetRef}>
										<UserRowItemListLoader count={3} />
									</div>
								) : null}
							</div>
						)}
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
});

export { ListFollowingModal };
