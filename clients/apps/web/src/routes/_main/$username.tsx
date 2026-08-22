import { createFileRoute } from "@tanstack/react-router";
import { MainContainer } from "@/core/components/ui/main-container";
import { RiHeartLine, RiLoader4Line, RiMenu5Line } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

import {
	UserProfileTab,
	UserProfileTabContent,
	UserProfileTabList,
	UserProfileTabTrigger,
} from "@/features/user/user-profile/user-profile-tab";
import { ProfilePostList } from "@/features/user/user-profile/profile-post-list";
import { UserProfileView } from "@/features/user/user-profile/profile-view";

export const Route = createFileRoute("/_main/$username")({
	component: ProfilePage,
});

function ProfilePage() {
	const { username: routeUsername } = Route.useParams();
	const username = routeUsername.startsWith("@")
		? routeUsername.slice(1)
		: routeUsername;

	const profileQuery = useUserProfile({ username });

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<AppHeaderTitle>
						{profileQuery.data ? profileQuery.data.user.fullName : "-"}
					</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			{profileQuery.isLoading ? (
				<div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center border-x border-border">
					<RiLoader4Line className="size-8 animate-spin text-sky-500" />
				</div>
			) : profileQuery.isSuccess ? (
				<UserProfileView user={profileQuery.data.user} />
			) : profileQuery.isError ? (
				<div className="mx-auto min-h-screen max-w-2xl border-x border-border p-12 text-center">
					<h1 className="text-xl font-bold text-foreground">
						This account doesn't exist
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Check the username and try again.
					</p>
					<Button asChild variant="outline" className="mt-5">
						<Link to="/search">Back to search</Link>
					</Button>
				</div>
			) : null}

			{profileQuery.data?.user ? (
				profileQuery.data?.user.hasBlockedAuthenticatedInUser ? null : (
					<UserProfileTab defaultValue="posts">
						<UserProfileTabList>
							<UserProfileTabTrigger value="posts">
								<RiMenu5Line className="size-5" />
								Posts
							</UserProfileTabTrigger>
							<UserProfileTabTrigger value="likes">
								<RiHeartLine className="size-5" />
								Likes
							</UserProfileTabTrigger>
						</UserProfileTabList>
						<UserProfileTabContent value="posts">
							<ProfilePostList
								userId={profileQuery.data?.user.id}
								type="posts"
							/>
						</UserProfileTabContent>
						<UserProfileTabContent value="likes">
							<ProfilePostList
								userId={profileQuery.data?.user.id}
								type="likes"
							/>
						</UserProfileTabContent>
					</UserProfileTab>
				)
			) : null}
		</MainContainer>
	);
}
