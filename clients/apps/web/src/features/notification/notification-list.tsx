import {
	RiChat3Line,
	RiHeartFill,
	RiNotification3Line,
	RiRepeatLine,
	RiUserAddLine,
} from "@remixicon/react";
import { useState } from "react";

type NotificationItem = {
	id: string;
	type: "like" | "repost" | "comment" | "follow";
	user: {
		name: string;
		handle: string;
		avatar: string;
	};
	time: string;
	contentSnippet?: string;
};

const FAKE_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "notif-1",
		type: "like",
		user: {
			name: "Sophie Martin",
			handle: "sophiem",
			avatar:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		},
		time: "10 min ago",
		contentSnippet: "Excited to launch our new interface on Graphy!...",
	},
	{
		id: "notif-2",
		type: "repost",
		user: {
			name: "Alexandre Dubois",
			handle: "alex_dev",
			avatar:
				"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
		},
		time: "1h ago",
		contentSnippet: "TypeScript 5.5 brings so many improvements...",
	},
	{
		id: "notif-3",
		type: "follow",
		user: {
			name: "Lucas Bernard",
			handle: "lucas_b",
			avatar:
				"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
		},
		time: "3h ago",
	},
	{
		id: "notif-4",
		type: "comment",
		user: {
			name: "Emma Laurent",
			handle: "emma_design",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		},
		time: "5h ago",
		contentSnippet: "Great work! I completely agree with this approach.",
	},
];

export function NotificationList() {
	const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

	return (
		<div className="divide-y divide-border">
			{/* Header */}
			<div className="p-4 border-b border-border">
				<h1 className="text-xl font-bold text-foreground flex items-center gap-2">
					<RiNotification3Line className="h-6 w-6 text-sky-500" />
					<span>Notifications</span>
				</h1>

				{/* Tabs */}
				<div className="flex gap-4 mt-4 border-b border-border">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === "all"
								? "border-sky-500 text-sky-500"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						All
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("mentions")}
						className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === "mentions"
								? "border-sky-500 text-sky-500"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						Mentions
					</button>
				</div>
			</div>

			{/* List */}
			<div className="divide-y divide-border">
				{FAKE_NOTIFICATIONS.map((notif) => (
					<div
						key={notif.id}
						className="p-4 flex gap-3 hover:bg-accent/60 transition-colors"
					>
						{/* Icon Badge */}
						<div className="shrink-0 pt-0.5">
							{notif.type === "like" && (
								<RiHeartFill className="h-5 w-5 text-rose-500" />
							)}
							{notif.type === "repost" && (
								<RiRepeatLine className="h-5 w-5 text-emerald-500" />
							)}
							{notif.type === "comment" && (
								<RiChat3Line className="h-5 w-5 text-sky-500" />
							)}
							{notif.type === "follow" && (
								<RiUserAddLine className="h-5 w-5 text-indigo-500" />
							)}
						</div>

						{/* Detail */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<img
									src={notif.user.avatar}
									alt={notif.user.name}
									className="h-8 w-8 rounded-full object-cover shrink-0"
								/>
								<div className="min-w-0 text-xs">
									<span className="font-semibold text-foreground">
										{notif.user.name}
									</span>{" "}
									<span className="text-muted-foreground">
										{notif.type === "like" && "liked your post"}
										{notif.type === "repost" && "reposted your post"}
										{notif.type === "comment" && "commented on your post"}
										{notif.type === "follow" && "started following you"}
									</span>
								</div>
							</div>

							{notif.contentSnippet && (
								<p className="mt-2 text-xs text-muted-foreground bg-muted/60 p-2.5 rounded-xl border border-border">
									"{notif.contentSnippet}"
								</p>
							)}

							<span className="text-[10px] text-muted-foreground mt-1 block">
								{notif.time}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
