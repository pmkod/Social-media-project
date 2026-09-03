import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { data, isLoading, isError, refetch, isRefetching } =
		useFollowSuggestions();
	const users = data?.pages.flatMap((page) => page.users) ?? [];

	return (
		<aside className="hidden 2xl:block w-100 pt-4 h-screen sticky top-0 overflow-y-auto">
			<Card>
				<CardHeader>
					<CardTitle>Who to follow</CardTitle>
				</CardHeader>
				<CardContent paddingZero>
					{isLoading ? (
						<UserRowItemListLoader className="pb-4" />
					) : isError ? (
						<ExceptionBlock
							title="Unable to load suggestions"
							description="An error occurred while loading profiles to follow."
							onRefresh={() => refetch()}
							isRefetching={isRefetching}
							bordered={false}
							className="h-96"
						/>
					) : users.length === 0 ? (
						<EmptyBlock
							title="No suggestions"
							description="No suggestions right now"
							onRefresh={() => refetch()}
							isRefetching={isRefetching}
							bordered={false}
							className="h§-96"
						/>
					) : (
						<div className="pb-4">
							{users.map((user) => (
								<UserRowItem key={user.id} user={user} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</aside>
	);
}

export { FollowSuggestions };
