import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import {
	removeDiscussionFromCache,
	updateDiscussionInCache,
} from "../common/discussion-cache.ts";

const useDeleteDiscussion = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (discussionId: string) =>
			httpClient
				.delete(`discussions/${discussionId}`)
				.json<{ message: string }>(),
		onSuccess: (_, discussionId) =>
			removeDiscussionFromCache(queryClient, discussionId),
	});
};

const useLeaveDiscussion = () => {
	const queryClient = useQueryClient();
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
				.json<{ message: string; userId: string }>(),
		onSuccess: (_, { discussionId }) =>
			removeDiscussionFromCache(queryClient, discussionId),
	});
};

const useRemoveDiscussionMember = () => {
	const queryClient = useQueryClient();
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
				.json<{ message: string; userId: string }>(),
		onSuccess: (_, { discussionId, userId }) => {
			updateDiscussionInCache(queryClient, discussionId, (discussion) => ({
				...discussion,
				members: discussion.members.filter((member) => member.userId !== userId),
			}));
		},
	});
};

const useSetDiscussionBlocked = () => {
	const queryClient = useQueryClient();
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
		onSuccess: ({ member }, { discussionId }) => {
			updateDiscussionInCache(queryClient, discussionId, (discussion) => ({
				...discussion,
				currentUserIsBlocked: member.isBlocked,
			}));
		},
	});
};

const useAddDiscussionMembers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			discussionId,
			users,
		}: {
			discussionId: string;
			users: User[];
		}) =>
			httpClient
				.post(`discussions/${discussionId}/members`, {
					json: { userIds: users.map((user) => user.id) },
				})
				.json<{ addedUserIds: string[]; addedCount: number }>(),
		onSuccess: ({ addedUserIds }, { discussionId, users }) => {
			const addedUserIdsSet = new Set(addedUserIds);
			const now = new Date().toISOString();
			updateDiscussionInCache(queryClient, discussionId, (discussion) => ({
				...discussion,
				members: [
					...discussion.members,
					...users
						.filter(
							(user) =>
								addedUserIdsSet.has(user.id) &&
								!discussion.members.some((member) => member.userId === user.id),
						)
						.map((user) => ({
							userId: user.id,
							role: "MEMBER" as const,
							joinedAt: now,
							lastReadAt: now,
							user,
						})),
				],
			}));
		},
	});
};

export {
	useAddDiscussionMembers,
	useDeleteDiscussion,
	useLeaveDiscussion,
	useRemoveDiscussionMember,
	useSetDiscussionBlocked,
};
