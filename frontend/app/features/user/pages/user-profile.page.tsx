import { AspectRatio } from "@/core/components/ui/aspect-ratio";
import { Avatar } from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { formatNumberToCompact } from "@/core/lib/utils";
import { UserPosts } from "@/features/post/components/user-posts";
import { useParams } from "react-router";
import { useUser } from "../queries/use-user";

const UserProfilePage = () => {
	const params = useParams<{ username: string }>();
	const { isLoading, isSuccess, data } = useUser({
		username: params.username || "",
	});
	return (
		<div className="flex-1 pt-7">
			{isLoading ? null : isSuccess ? (
				<section className="bg-background border rounded-lg mb-7 border-gray-300">
					<AspectRatio ratio={5 / 1} className="bg-muted">
						{/* {userData.background && ( */}
						<img
							// src={userData.background}
							className="h-full w-full object-cover"
							alt="Profile Background"
						/>
						{/* )} */}
					</AspectRatio>
					<div className="relative w-full flex flex-col items-center gap-7 p-4 md:flex-row">
						<Avatar className="size-32 -mt-20 md:size-40 border bg-white border-gray-300 rounded-lg" />
						<div className="text-center md:text-start">
							<div>
								<h1 className="text-2xl font-bold line-clamp-1">
									{data.user.fullName}
								</h1>
								<p className="text-muted-foreground line-clamp-1">
									@{data.user.username}
								</p>
							</div>
							<div className="inline-flex w-full">
								<p className="text-primary after:content-['\00b7'] after:mx-1">
									{formatNumberToCompact(data.user.postCount)} posts
								</p>
								<p className="text-primary after:content-['\00b7'] after:mx-1">
									{formatNumberToCompact(data.user.followerCount)} followers
								</p>
								<p className="text-primary">
									{formatNumberToCompact(data.user.followCount)} follow
								</p>
							</div>
							<div className="flex items-center mt-2">
								<Button variant="outline" size="lg">
									Modifier mon profil
								</Button>
							</div>
						</div>
					</div>
				</section>
			) : null}

			<UserPosts />
		</div>
	);
};

export default UserProfilePage;
