import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { data, isLoading, isError, refetch } = useFollowSuggestions();

	return (
		<aside className="hidden lg:block w-100 pt-4 pr-4 h-screen sticky top-0 overflow-y-auto">
			<Card>
				<CardHeader>
					<CardTitle>À suivre</CardTitle>
				</CardHeader>
				<CardContent paddingZero>
					{isLoading ? (
						<UserRowItemListLoader className="pb-4" />
					) : isError ? (
						<ExceptionBlock
							title="Impossible de charger les suggestions"
							description="Une erreur s'est produite lors du chargement des profils à suivre."
							onRefresh={() => void refetch()}
							borderless
							className="min-h-48"
						/>
					) : data?.users.length === 0 ? (
						<div className="py-6 px-6 text-center text-sm text-muted-foreground">
							Aucune suggestion pour le moment
						</div>
					) : (
						<div className="pb-4">
							{data?.users.map((user) => (
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
