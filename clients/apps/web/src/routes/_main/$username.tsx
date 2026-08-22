import { RiHeartLine, RiMenu5Line } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block";
import { MainContainer } from "@/core/components/ui/main-container";
import { ProfilePostList } from "@/features/user/user-profile/profile-post-list";
import { UserProfileView } from "@/features/user/user-profile/profile-view";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import {
	UserProfileTab,
	UserProfileTabContent,
	UserProfileTabList,
	UserProfileTabListLoader,
	UserProfileTabTrigger,
} from "@/features/user/user-profile/user-profile-tab";
import { UserProfileViewLoader } from "@/features/user/user-profile/user-profile-view-loader.tsx";

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
				<UserProfileViewLoader />
			) : profileQuery.isSuccess ? (
				<UserProfileView user={profileQuery.data.user} />
			) : profileQuery.isError ? (
				<ExceptionBlock
					title="This account doesn't exist"
					description="Check the username and try again."
				/>
			) : null}

			{profileQuery.data?.user.hasBlockedAuthenticatedInUser === true ? (
				<ExceptionBlock
					title="You are blocked"
					description="You can’t view this profile or interact with this user because they have blocked you."
				/>
			) : (
				<UserProfileTab defaultValue="posts">
					{profileQuery.isLoading ? (
						<UserProfileTabListLoader />
					) : profileQuery.isSuccess ? (
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
					) : null}

					<UserProfileTabContent value="posts">
						<ProfilePostList userId={profileQuery.data?.user.id} type="posts" />
					</UserProfileTabContent>
					<UserProfileTabContent value="likes">
						<ProfilePostList userId={profileQuery.data?.user.id} type="likes" />
					</UserProfileTabContent>
				</UserProfileTab>
			)}
		</MainContainer>
	);
}
