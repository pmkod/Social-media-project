import {
	RiCompassLine,
	RiLineChartLine,
	RiSearchLine,
	RiUserAddLine,
} from "@remixicon/react";

type Trend = {
	category: string;
	topic: string;
	postsCount: string;
};

const TRENDING_TOPICS: Trend[] = [
	{
		category: "Technologie · Tendance",
		topic: "#React19",
		postsCount: "42,5k publications",
	},
	{
		category: "Développement · Tendance",
		topic: "#TanStackRouter",
		postsCount: "12,8k publications",
	},
	{
		category: "Design UI/UX",
		topic: "#Glassmorphism",
		postsCount: "8,1k publications",
	},
	{
		category: "Web3 · Tendance",
		topic: "#OpenSource",
		postsCount: "95,3k publications",
	},
];

export function ExploreView() {
	return (
		<div className="divide-y divide-border">
			{/* Search Header */}
			<div className="p-4 border-b border-border space-y-3">
				<h1 className="text-xl font-bold text-foreground flex items-center gap-2">
					<RiCompassLine className="h-6 w-6 text-sky-500" />
					<span>Explorer</span>
				</h1>
				<div className="relative">
					<RiSearchLine className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Rechercher sur Graphy..."
						className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-2xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</div>
			</div>

			{/* Trending Section */}
			<div className="p-4">
				<h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
					<RiLineChartLine className="h-4 w-4 text-emerald-500" />
					<span>Tendances pour vous</span>
				</h2>

				<div className="space-y-3">
					{TRENDING_TOPICS.map((trend) => (
						<div
							key={trend.topic}
							className="p-3 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
						>
							<div className="text-[11px] text-muted-foreground">{trend.category}</div>
							<div className="text-sm font-bold text-foreground mt-0.5">
								{trend.topic}
							</div>
							<div className="text-[11px] text-muted-foreground mt-0.5">
								{trend.postsCount}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Who to follow Section */}
			<div className="p-4">
				<h2 className="text-sm font-bold text-foreground mb-3">
					Suggestions de comptes
				</h2>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img
								src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
								alt="Avatar"
								className="h-9 w-9 rounded-full object-cover"
							/>
							<div>
								<div className="text-xs font-semibold text-foreground">
									Claire Durand
								</div>
								<div className="text-[11px] text-muted-foreground">@claire_design</div>
							</div>
						</div>
						<button
							type="button"
							className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
						>
							<RiUserAddLine className="h-3.5 w-3.5" />
							<span>Suivre</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
