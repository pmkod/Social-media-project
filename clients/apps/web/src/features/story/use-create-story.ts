import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Story } from "./common/story.ts";
import { storyQueryKeys } from "./common/story-query-keys.ts";

type CreateStoryInput = {
	media: File;
};

type CreateStoryResponse = {
	message: string;
	story: Story;
};

const createStory = async (input: CreateStoryInput): Promise<Story> => {
	const formData = new FormData();
	formData.append("media", input.media);
	const response = await httpClient
		.post("stories", { body: formData, timeout: 120_000 })
		.json<CreateStoryResponse>();
	return response.story;
};

const useCreateStory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: storyQueryKeys.root });
		},
	});
};

export { useCreateStory };
