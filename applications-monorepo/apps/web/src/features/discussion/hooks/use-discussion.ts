import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type { DiscussionResponse } from "../common/discussion.ts";

const useDiscussion = (discussionId: string) =>
	useQuery({
		queryKey: discussionQueryKeys.detail(discussionId),
		queryFn: () =>
			httpClient.get(`discussions/${discussionId}`).json<DiscussionResponse>(),
		enabled: Boolean(discussionId),
	});

export { useDiscussion };
