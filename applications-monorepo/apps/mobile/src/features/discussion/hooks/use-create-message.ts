import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { CreateMessageResponse } from "../common/discussion";
import { discussionQueryKeys } from "../common/discussion.query-keys";

type CreateMessageInput = {
	discussionId: string;
	content?: string;
	images?: Array<{ uri: string; name: string; type: string }>;
};

export const useCreateMessage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ discussionId, content, images }: CreateMessageInput) => {
			const formData = new FormData();
			if (content) formData.append("content", content);
			for (const image of images ?? []) {
				formData.append("images", image as unknown as Blob);
			}

			return httpClient
				.post(`chat/create-message/${discussionId}`, { body: formData })
				.json<CreateMessageResponse>();
		},
		onSuccess: (_, { discussionId }) => {
			queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.messagesRoot(discussionId),
			});
			queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.listsRoot,
			});
		},
	});
};
