import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { discussionQueryKeys } from "../common/discussion.query-keys";
import type { DiscussionResponse } from "../common/discussion";

export const useDiscussion = (discussionId: string) =>
	useQuery({
		queryKey: discussionQueryKeys.detail(discussionId),
		queryFn: () =>
			httpClient.get(`discussions/${discussionId}`).json<DiscussionResponse>(),
		enabled: Boolean(discussionId),
	});
