import { Button } from "@/core/components/ui/button.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import { useSearchUsers } from "./use-search-users.ts";

type UserSearchListProps = {
	query: string;
};

function UserSearchList({ query }: UserSearchListProps) {
	const usersQuery = useSearchUsers({ query, limit: 5 });

	if (query.trim().length === 0) return null;

	const users = usersQuery.data?.pages.flatMap((page) => page.users) ?? [];

	return (
		<section className="mb-6 overflow-hidden rounded-xl border border-border bg-background">
			{usersQuery.isLoading ? (
				<UserRowItemListLoader count={5} />
			) : usersQuery.isError ? (
				<ExceptionBlock
					bordered={false}
					title="Unable to load people"
					description="An error occurred while searching for people."
					onRefresh={() => void usersQuery.refetch()}
					isRefetching={usersQuery.isRefetching}
				/>
			) : users.length === 0 ? (
				<p className="px-6 py-5 text-sm text-muted-foreground">
					No people found for “{query}”.
				</p>
			) : (
				<>
					{users.map((user) => (
						<UserRowItem key={user.id} user={user} />
					))}
					{usersQuery.hasNextPage ? (
						<div className="border-t border-border p-2 flex justify-center">
							<Button
								type="button"
								variant="ghost"
								isLoading={usersQuery.isFetchingNextPage}
								onClick={() => void usersQuery.fetchNextPage()}
							>
								Show more people
							</Button>
						</div>
					) : null}
				</>
			)}
		</section>
	);
}

export { UserSearchList };
