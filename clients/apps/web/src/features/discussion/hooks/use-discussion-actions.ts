import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";

const useInvalidateDiscussion = () => {
	const queryClient = useQueryClient();
	return (discussionId: string) => {
		void queryClient.invalidateQueries({ queryKey: discussionQueryKeys.root });
		void queryClient.invalidateQueries({
			queryKey: discussionQueryKeys.detail(discussionId),
		});
	};
};

const useDeleteDiscussion = () => {
	const invalidateDiscussion = useInvalidateDiscussion();
	return useMutation({
		mutationFn: (discussionId: string) =>
			httpClient
				.delete(`discussions/${discussionId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_, discussionId) => invalidateDiscussion(discussionId),
	});
};

const useLeaveDiscussion = () => {
	const invalidateDiscussion = useInvalidateDiscussion();
	return useMutation({
		mutationFn: ({
			discussionId,
			userId,
		}: {
			discussionId: string;
			userId: string;
		}) =>
			httpClient
				.delete(`discussions/${discussionId}/members/${userId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_, { discussionId }) => invalidateDiscussion(discussionId),
	});
};

const useRemoveDiscussionMember = () => {
	const invalidateDiscussion = useInvalidateDiscussion();
	return useMutation({
		mutationFn: ({
			discussionId,
			userId,
		}: {
			discussionId: string;
			userId: string;
		}) =>
			httpClient
				.delete(`discussions/${discussionId}/members/${userId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_, { discussionId }) => invalidateDiscussion(discussionId),
	});
};

const useSetDiscussionBlocked = () => {
	const invalidateDiscussion = useInvalidateDiscussion();
	return useMutation({
		mutationFn: ({
			discussionId,
			userId,
			isBlocked,
		}: {
			discussionId: string;
			userId: string;
			isBlocked: boolean;
		}) =>
			httpClient
				.patch(`discussions/${discussionId}/members/${userId}`, {
					json: { isBlocked },
				})
				.json<{ member: { isBlocked: boolean } }>(),
		onSuccess: (_, { discussionId }) => invalidateDiscussion(discussionId),
	});
};

const useAddDiscussionMembers = () => {
	const invalidateDiscussion = useInvalidateDiscussion();
	return useMutation({
		mutationFn: ({
			discussionId,
			userIds,
		}: {
			discussionId: string;
			userIds: string[];
		}) =>
			httpClient
				.post(`discussions/${discussionId}/members`, { json: { userIds } })
				.json<{ addedUserIds: string[]; addedCount: number }>(),
		onSuccess: (_, { discussionId }) => invalidateDiscussion(discussionId),
	});
};

export {
	useAddDiscussionMembers,
	useDeleteDiscussion,
	useLeaveDiscussion,
	useRemoveDiscussionMember,
	useSetDiscussionBlocked,
};
