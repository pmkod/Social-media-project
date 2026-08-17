import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { suggestions } = useFollowSuggestions();

	return (
		<aside className="hidden lg:block w-96 p-4 space-y-4 h-screen sticky top-0 overflow-y-auto">
			{/* Search Box */}
			<div className="p-6 bg-muted/60 rounded-2xl border border-border">
				<h3 className="text-xs font-bold text-foreground mb-2">
					À suivre absolument
				</h3>
				<div className="space-y-3">
					{suggestions.map((suggestion) => (
						<div
							key={suggestion.id}
							className="flex items-center justify-between"
						>
							<div className="flex items-center gap-2.5 min-w-0">
								<img
									src={suggestion.avatarUrl}
									alt={suggestion.name}
									className="h-8 w-8 rounded-full object-cover"
								/>
								<div className="min-w-0 text-xs">
									<div className="font-semibold text-foreground truncate">
										{suggestion.name}
									</div>
									<div className="text-[10px] text-muted-foreground truncate">
										{suggestion.handle}
									</div>
								</div>
							</div>
							<button
								type="button"
								className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-[11px] font-medium transition-colors"
							>
								Suivre
							</button>
						</div>
					))}
				</div>
			</div>
		</aside>
	);
}

export { FollowSuggestions };
