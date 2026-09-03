import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { StoriesResponse } from "./common/story.ts";
import { storyQueryKeys } from "./common/story-query-keys.ts";

const useMarkStoryViewed = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (storyId: string) => {
			return httpClient
				.post(`stories/${storyId}/view`)
				.json<{ success: boolean }>();
		},
		onSuccess: (_, storyId) => {
			queryClient.setQueryData<StoriesResponse>(
				storyQueryKeys.root,
				(oldData) => {
					if (!oldData) return oldData;
					return {
						stories: oldData.stories.map((group) => ({
							...group,
							stories: group.stories.map((story) =>
								story.id === storyId
									? { ...story, isViewedByAuthenticatedUser: true }
									: story,
							),
						})),
					};
				},
			);
		},
	});
};

export { useMarkStoryViewed };
