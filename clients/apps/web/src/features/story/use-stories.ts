import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { StoriesResponse } from "./common/story.ts";
import { storyQueryKeys } from "./common/story-query-keys.ts";

const fetchStories = async (): Promise<StoriesResponse> => {
	return httpClient.get("stories").json<StoriesResponse>();
};

const useStories = () => {
	return useQuery({
		queryKey: storyQueryKeys.root,
		queryFn: fetchStories,
		staleTime: 30_000,
	});
};

export { useStories };
