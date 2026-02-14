import { AspectRatio } from "@/core/components/ui/aspect-ratio";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { formatNumberToCompact, getInitials } from "@/core/lib/utils";
import { UserPosts } from "@/features/post/components/user-posts";
import type { User } from "@/features/post/types/post";

export const userData: User = {
	id: "1",
	firstName: "John",
	lastName: "Doe",
	name: "John Doe",
	password: "StrongPass123",
	username: "john.doe",
	role: "Next.js Developer",
	avatar: "/images/avatars/male-01.svg",
	background: "",
	status: "ONLINE",
	phoneNumber: "+15558675309",
	email: "john.doe@example.com",
	state: "California",
	country: "United States",
	address: "123 Main Street, Apt 4B",
	zipCode: "90210",
	language: "English",
	timeZone: "GMT+08:00",
	currency: "USD",
	organization: "Tech Innovations Inc.",
	twoFactorAuth: false,
	loginAlerts: true,
	accountReoveryOption: "email",
	connections: 1212,
	followers: 3300,
};

const UserProfilePage = () => {
	return (
		<div className="flex-1 pt-7">
			<section className="bg-background border rounded-lg mb-7 border-gray-300">
				<AspectRatio ratio={5 / 1} className="bg-muted">
					{userData.background && (
						<img
							src={userData.background}
							className="h-full w-full object-cover"
							alt="Profile Background"
						/>
					)}
				</AspectRatio>
				<div className="relative w-full flex flex-col items-center gap-7 p-4 md:flex-row">
					<Avatar className="size-32 -mt-20 md:size-40 border bg-white border-gray-300 rounded-lg">
						<AvatarImage
							src={userData.avatar}
							alt="Profile Avatar"
							className="border-4 border-background"
						/>
						<AvatarFallback className="border-4 border-background">
							{getInitials(userData.name)}
						</AvatarFallback>
					</Avatar>
					<div className="text-center md:text-start">
						<div>
							<h1 className="text-2xl font-bold line-clamp-1">
								{userData.name}
							</h1>
							<p className="text-muted-foreground line-clamp-1">
								{userData.state && `${userData.state}, `}
								{userData.country}
							</p>
						</div>
						<div className="inline-flex w-full">
							<p className="text-primary after:content-['\00b7'] after:mx-1">
								{formatNumberToCompact(userData.followers)} followers
							</p>
							<p className="text-primary">
								{formatNumberToCompact(userData.connections)} connections
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
			<UserPosts />
		</div>
	);
};

export default UserProfilePage;
