import { RiLoader4Line, RiUserAddLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card.tsx";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import { authenticatedUserQueryKey } from "@/features/user/get-authenticated-user/authenticated-user.query-key.ts";
import { userConnectionsQueryKeys } from "@/features/user/profile/user-connections.query-keys.ts";
import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { data, isLoading, isError } = useFollowSuggestions();
	const queryClient = useQueryClient();

	const followMutation = useMutation({
		mutationFn: (userId: string) =>
			httpClient.post(`users/${userId}/followers`).json(),
		onSuccess: () => {
			// queryClient.invalidateQueries({
			// 	queryKey: userListQueryKeys.followSuggestions(),
			// });
			queryClient.invalidateQueries({ queryKey: authenticatedUserQueryKey });
			queryClient.invalidateQueries({
				queryKey: userConnectionsQueryKeys.root,
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.feedFollowing(),
			});
		},
	});

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
							{data?.users.map((suggestion) => {
								const displayName = suggestion.fullName || suggestion.username;
								const avatar =
									suggestion.avatarUrl ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
								const isFollowingThisUser =
									followMutation.isPending &&
									followMutation.variables === suggestion.id;

								return (
									<div
										key={suggestion.id}
										className="flex items-center justify-between gap-3 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 py-3 px-6 transition-colors"
									>
										<Link
											to="/$username"
											params={{ username: `@${suggestion.username}` }}
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
													@{suggestion.username}
												</div>
											</div>
										</Link>
										<Button
											type="button"
											size="sm"
											disabled={isFollowingThisUser}
											onClick={() => followMutation.mutate(suggestion.id)}
											className="shrink-0"
										>
											{isFollowingThisUser ? (
												<RiLoader4Line className="size-4 animate-spin" />
											) : (
												<>
													<RiUserAddLine className="size-4 mr-1" />
													Suivre
												</>
											)}
										</Button>
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
