import { RiLoader4Line } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import type { NiceModalHandler } from "@/core/components/ui/nice-modal.tsx";
import { cn } from "@/core/lib/utils.ts";
import { FollowButton } from "./follow-button.tsx";
import type { User } from "./user.ts";

type UserListModalQuery = {
	data: { pages: Array<{ users: User[] }> } | undefined;
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean | undefined;
	isFetchingNextPage: boolean;
	fetchNextPage: () => Promise<unknown>;
	refetch: () => Promise<unknown>;
};

type UserListModalProps = {
	modal: Pick<NiceModalHandler, "visible" | "remove">;
	query: UserListModalQuery;
	username: string;
	title: string;
	emptyTitle: string;
};

const UserListModal = ({
	modal,
	query,
	username,
	title,
	emptyTitle,
}: UserListModalProps) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
	const users = query.data?.pages.flatMap((page) => page.users) ?? [];

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
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) modal.remove();
			}}
		>
			<DialogContent className="max-h-[min(82vh,44rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
				<DialogHeader className="border-b border-border px-5 py-4 pr-14">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>@{username}</DialogDescription>
				</DialogHeader>

				<div
					ref={scrollContainerRef}
					className="min-h-48 overflow-y-auto overscroll-contain sm:max-h-[34rem]"
				>
					{query.isLoading ? (
						<div className="flex min-h-48 items-center justify-center">
							<RiLoader4Line className="size-6 animate-spin text-sky-500" />
						</div>
					) : query.isError ? (
						<ExceptionBlock
							title="Unable to load this list"
							description="An error occurred while loading this list."
							onRefresh={() => void query.refetch()}
							borderless
						/>
					) : users.length === 0 ? (
						<EmptyBlock
							title={emptyTitle}
							description="This list will appear here once it contains users."
							borderless
						/>
					) : (
						<div className="divide-y divide-border">
							{users.map((user) => {
								const displayName =
									user.displayName || user.fullName || user.username;
								const avatar =
									user.avatarUrl ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

								return (
									<div
										key={user.id}
										className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/60"
									>
										<Link
											to="/$username"
											params={{ username: `@${user.username}` }}
											onClick={() => modal.remove()}
											className="flex min-w-0 flex-1 items-center gap-3"
										>
											<img
												src={avatar}
												alt={displayName}
												className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold text-foreground">
													{displayName}
												</p>
												<p className="truncate text-xs text-muted-foreground">
													@{user.username}
												</p>
												{user.bio ? (
													<p className="mt-1 line-clamp-1 text-xs text-foreground/80">
														{user.bio}
													</p>
												) : null}
											</div>
										</Link>
										{user.isOwnProfile ? null : <FollowButton user={user} />}
									</div>
								);
							})}

							<div
								ref={observerTargetRef}
								className={cn(
									"flex h-1 items-center justify-center",
									query.isFetchingNextPage && "h-14",
								)}
							>
								{query.isFetchingNextPage ? (
									<RiLoader4Line className="size-5 animate-spin text-sky-500" />
								) : null}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export { UserListModal };
