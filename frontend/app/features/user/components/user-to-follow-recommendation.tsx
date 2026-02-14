import { buttonVariants } from "@/core/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";
import type { User } from "@/features/post/types/post";
import { Link } from "react-router";
import { UserToFollowItem } from "./user-to-follow.item";

export type UserProfileConnectionType = Pick<
	User,
	"name" | "avatar" | "connections"
>;

export const connectionsData: UserProfileConnectionType[] = [
	{
		name: "John Doe",
		avatar: "/images/avatars/male-01.svg",
		connections: 1240,
	},
	{
		name: "Emily Smith",
		avatar: "/images/avatars/female-01.svg",
		connections: 980,
	},
	{
		name: "Michael Brown",
		avatar: "/images/avatars/male-02.svg",
		connections: 2150,
	},
	{
		name: "Olivia Martinez",
		avatar: "/images/avatars/female-03.svg",
		connections: 1875,
	},
	{
		name: "Sarah Johnson",
		avatar: "/images/avatars/female-02.svg",
		connections: 3420,
	},
];

const UserToFollowRecommendation = () => {
	return (
		<div className="pt-7 max-w-sm w-full">
			<Card className="rounded-lg shadow-none">
				<article>
					<CardHeader className="flex-row flex items-center mb-5 justify-between space-y-0">
						<CardTitle className="text-xl">People you may know</CardTitle>
						<Link
							to="/"
							className={cn(
								buttonVariants({ variant: "link" }),
								"size-fit p-0",
							)}
						>
							See All
						</Link>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-y-3">
							{connectionsData.map((connection) => (
								<UserToFollowItem key={connection.name} data={connection} />
							))}
						</ul>
					</CardContent>
				</article>
			</Card>
		</div>
	);
};

export { UserToFollowRecommendation };
