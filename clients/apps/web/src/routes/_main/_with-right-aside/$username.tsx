import { RiFlashlightLine, RiHeartLine, RiMenu5Line } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block";
import { MainContainer } from "@/core/components/ui/main-container";
import { UserLikedPosts } from "@/features/post/user-liked-posts/user-liked-posts";
import { UserPosts } from "@/features/post/user-posts/user-posts";
import { UserSparks } from "@/features/spark/spark-gallery.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import {
	UserProfileTab,
	UserProfileTabContent,
	UserProfileTabList,
	UserProfileTabListLoader,
	UserProfileTabTrigger,
} from "@/features/user/user-profile/user-profile-tab";
import { UserProfileView } from "@/features/user/user-profile/user-profile-view";
import { UserProfileViewLoader } from "@/features/user/user-profile/user-profile-view-loader.tsx";

export const Route = createFileRoute("/_main/_with-right-aside/$username")({
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
			<div className="border-b rounded-b-xl overflow-hidden">
				{profileQuery.data?.user.hasBlockedAuthenticatedInUser === true ? (
					<div className="border-x">
						<ExceptionBlock
							title="You are blocked"
							description="You can’t view this profile or interact with this user because they have blocked you."
							bordered={false}
						/>
					</div>
				) : profileQuery.data?.user.isBlockedByAuthenticatedUser ? (
					<div className="border-x">
						<ExceptionBlock
							title="You blocked this user"
							description="You can’t view this profile or interact with this user"
							bordered={false}
						/>
					</div>
				) : (
					<UserProfileTab key={username} defaultValue="posts">
						{profileQuery.isLoading ? (
							<UserProfileTabListLoader />
						) : profileQuery.isSuccess ? (
							<UserProfileTabList>
								<UserProfileTabTrigger value="posts">
									<RiMenu5Line className="size-5" />
									Posts
								</UserProfileTabTrigger>
								<UserProfileTabTrigger value="sparks">
									<RiFlashlightLine className="size-5" />
									Sparks
								</UserProfileTabTrigger>
								<UserProfileTabTrigger value="likes">
									<RiHeartLine className="size-5" />
									Likes
								</UserProfileTabTrigger>
							</UserProfileTabList>
						) : null}

						<UserProfileTabContent value="posts">
							<UserPosts userId={profileQuery.data?.user.id} />
						</UserProfileTabContent>
						<UserProfileTabContent value="sparks">
							<UserSparks userId={profileQuery.data?.user.id} />
						</UserProfileTabContent>
						<UserProfileTabContent value="likes">
							<UserLikedPosts userId={profileQuery.data?.user.id} />
						</UserProfileTabContent>
					</UserProfileTab>
				)}
			</div>
		</MainContainer>
	);
}
