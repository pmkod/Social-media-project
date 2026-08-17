import { Button } from "@/core/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card.tsx";
import { useFollowSuggestions } from "./use-follow-suggestions.ts";

function FollowSuggestions() {
	const { suggestions } = useFollowSuggestions();

	return (
		<aside className="hidden lg:block w-100 pt-4 pr-4 h-screen sticky top-0 overflow-y-auto">
			<Card>
				<CardHeader>
					<CardTitle>À suivre</CardTitle>
				</CardHeader>
				<CardContent paddingZero>
					<div className="">
						{suggestions.map((suggestion) => (
							<div
								key={suggestion.id}
								className="flex items-center justify-between gap-3 hover:bg-gray-100 py-3 px-6 transition-colors"
							>
								<div className="flex items-center gap-2.5 min-w-0">
									<img
										src={suggestion.avatarUrl}
										alt={suggestion.name}
										className="size-10 shrink-0 rounded-full object-cover"
									/>
									<div className="min-w-0">
										<div className="font-semibold text-foreground truncate">
											{suggestion.name}
										</div>
										<div className="text-sm text-muted-foreground truncate">
											{suggestion.handle}
										</div>
									</div>
								</div>
								<Button type="button" size="sm">
									Suivre
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</aside>
	);
}

export { FollowSuggestions };
