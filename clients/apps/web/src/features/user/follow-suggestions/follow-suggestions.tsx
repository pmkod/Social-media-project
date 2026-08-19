import { RiLoader4Line } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { data, isLoading, isError } = useFollowSuggestions();

	if (isError) {
		return null;
	}

	return (
		<aside className="hidden lg:block w-100 pt-4 pr-4 h-screen sticky top-0 overflow-y-auto">
			<Card>
				<CardHeader>
					<CardTitle>À suivre</CardTitle>
				</CardHeader>
				<CardContent paddingZero>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<RiLoader4Line className="size-6 animate-spin text-sky-500" />
						</div>
					) : data?.users.length === 0 ? (
						<div className="py-6 px-6 text-center text-sm text-muted-foreground">
							Aucune suggestion pour le moment
						</div>
					) : (
						<div className="pb-4">
							{data?.users.map((user) => {
								const displayName = user.fullName || user.username;
								const avatar =
									user.avatarUrl ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
								return (
									<div
										key={user.id}
										className="flex items-center justify-between gap-3 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 py-3 px-6 transition-colors"
									>
										<Link
											to="/$username"
											params={{ username: `@${user.username}` }}
											className="flex items-center gap-2.5 min-w-0 flex-1 group"
										>
											<img
												src={avatar}
												alt={displayName}
												className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
											/>
											<div className="min-w-0 flex-1">
												<div className="font-semibold text-foreground truncate group-hover:underline text-sm">
													{displayName}
												</div>
												<div className="text-xs text-muted-foreground truncate">
													@{user.username}
												</div>
											</div>
										</Link>
										<FollowButton user={user} />
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</aside>
	);
}

export { FollowSuggestions };
