import { Avatar } from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { formatNumberToCompact } from "@/core/lib/utils";
import type { User } from "@/features/post/types/post";

export type UserProfileType = Pick<User, "name" | "avatar" | "connections">;

export function UserToFollowItem({ data }: { data: UserProfileType }) {
	return (
		<li className="flex items-center gap-x-2">
			<Avatar src={data.avatar} />
			<div>
				<p className="font-semibold">{data.name}</p>
				<p className="text-muted-foreground text-sm">
					{formatNumberToCompact(data.connections)} connections
				</p>
			</div>
			<Button className="ms-auto">Follow</Button>
		</li>
	);
}
