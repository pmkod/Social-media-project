import {
	IconBell,
	IconHeartFilled,
	IconMessageCircle,
	IconRepeat,
	IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";

interface NotificationItem {
	id: string;
	type: "like" | "repost" | "comment" | "follow";
	user: {
		name: string;
		handle: string;
		avatar: string;
	};
	time: string;
	contentSnippet?: string;
}

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
		time: "il y a 10 min",
		contentSnippet: "Ravi de lancer notre nouvelle interface sur Graphy !...",
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
		time: "il y a 1h",
		contentSnippet: "TypeScript 5.5 apporte tellement d'améliorations...",
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
		time: "il y a 3h",
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
		time: "il y a 5h",
		contentSnippet: "Super travail ! Totalement d'accord avec cette approche.",
	},
];

export function NotificationList() {
	const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

	return (
		<div className="divide-y divide-slate-200/80 dark:divide-slate-800">
			{/* Header */}
			<div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
				<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
					<IconBell className="h-6 w-6 text-sky-500" />
					<span>Notifications</span>
				</h1>

				{/* Tabs */}
				<div className="flex gap-4 mt-4 border-b border-slate-100 dark:border-slate-800">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === "all"
								? "border-sky-500 text-sky-500"
								: "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
						}`}
					>
						Toutes
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("mentions")}
						className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === "mentions"
								? "border-sky-500 text-sky-500"
								: "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
						}`}
					>
						Mentions
					</button>
				</div>
			</div>

			{/* List */}
			<div className="divide-y divide-slate-100 dark:divide-slate-800/60">
				{FAKE_NOTIFICATIONS.map((notif) => (
					<div
						key={notif.id}
						className="p-4 flex gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
					>
						{/* Icon Badge */}
						<div className="shrink-0 pt-0.5">
							{notif.type === "like" && (
								<IconHeartFilled className="h-5 w-5 text-rose-500" />
							)}
							{notif.type === "repost" && (
								<IconRepeat className="h-5 w-5 text-emerald-500" />
							)}
							{notif.type === "comment" && (
								<IconMessageCircle className="h-5 w-5 text-sky-500" />
							)}
							{notif.type === "follow" && (
								<IconUserPlus className="h-5 w-5 text-indigo-500" />
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
									<span className="font-semibold text-slate-900 dark:text-slate-100">
										{notif.user.name}
									</span>{" "}
									<span className="text-slate-500">
										{notif.type === "like" && "a aimé votre publication"}
										{notif.type === "repost" && "a repartagé votre publication"}
										{notif.type === "comment" && "a commenté votre publication"}
										{notif.type === "follow" && "a commencé à vous suivre"}
									</span>
								</div>
							</div>

							{notif.contentSnippet && (
								<p className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
									"{notif.contentSnippet}"
								</p>
							)}

							<span className="text-[10px] text-slate-400 mt-1 block">
								{notif.time}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
