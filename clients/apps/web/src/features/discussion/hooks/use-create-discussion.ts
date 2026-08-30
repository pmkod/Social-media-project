import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
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
			queryClient.setQueryData(discussionQueryKeys.detail(discussion.id), {
				discussion,
			});
			void queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.root,
			});
		},
	});
};

export type { CreateDiscussionInput };
export { useCreateDiscussion };
