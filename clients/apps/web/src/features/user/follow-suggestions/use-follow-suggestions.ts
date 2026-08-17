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
		{
			id: "lucas-bernard",
			name: "Lucas Bernard",
			handle: "@lucasb",
			avatarUrl:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
		},
		{
			id: "emma-dubois",
			name: "Emma Dubois",
			handle: "@emmad",
			avatarUrl:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
		},
		{
			id: "hugo-moreau",
			name: "Hugo Moreau",
			handle: "@hugom",
			avatarUrl:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		},
		{
			id: "chloe-leroy",
			name: "Chloé Leroy",
			handle: "@chloel",
			avatarUrl:
				"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
		},
	];

	return { suggestions };
};

export { useFollowSuggestions };
export type { FollowSuggestion };
