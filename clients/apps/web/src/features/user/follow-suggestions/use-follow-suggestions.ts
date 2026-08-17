type FollowSuggestion = {
	id: string;
	name: string;
	handle: string;
	avatarUrl: string;
};

const useFollowSuggestions = () => {
	const suggestions: FollowSuggestion[] = [
		{
			id: "sophie-martin",
			name: "Sophie Martin",
			handle: "@sophiem",
			avatarUrl:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		},
	];

	return { suggestions };
};

export { useFollowSuggestions };
export type { FollowSuggestion };
