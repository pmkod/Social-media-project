import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { upsertDiscussionInCache } from "../common/discussion-cache.ts";
import type {
	CreateDiscussionResponse,
	DiscussionType,
} from "../common/discussion.ts";

type CreateDiscussionInput = {
	type: DiscussionType;
	memberIds: string[];
	name?: string;
	description?: string;
};

const useCreateDiscussion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateDiscussionInput) =>
			httpClient
				.post("discussions", { json: input })
				.json<CreateDiscussionResponse>(),
		onSuccess: ({ discussion }) => {
			upsertDiscussionInCache(queryClient, discussion);
		},
	});
};

export type { CreateDiscussionInput };
export { useCreateDiscussion };
