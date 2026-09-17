import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	DiscussionResponse,
	DiscussionsResponse,
} from "../common/discussion.ts";

const useDeleteDiscussion = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (discussionId: string) =>
			httpClient
				.delete(`discussions/${discussionId}`)
				.json<{ message: string }>(),
		onSuccess: (_, discussionId) => {
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							discussions: page.discussions.filter(
								(discussion) => discussion.id !== discussionId,
							),
						})),
					},
			);
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.detail(discussionId),
				exact: true,
			});
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.messagesRoot(discussionId),
			});
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.mediaRoot(discussionId),
			});
		},
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
		onSuccess: (_, { discussionId }) => {
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							discussions: page.discussions.filter(
								(discussion) => discussion.id !== discussionId,
							),
						})),
					},
			);
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.detail(discussionId),
				exact: true,
			});
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.messagesRoot(discussionId),
			});
			queryClient.removeQueries({
				queryKey: discussionQueryKeys.mediaRoot(discussionId),
			});
		},
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
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussionId),
				(data) =>
					data
						? {
								...data,
								discussion: {
									...data.discussion,
									members: data.discussion.members.filter(
										(member) => member.userId !== userId,
									),
								},
							}
						: data,
			);
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							discussions: page.discussions.map((discussion) =>
								discussion.id === discussionId
									? {
											...discussion,
											members: discussion.members.filter(
												(member) => member.userId !== userId,
											),
										}
									: discussion,
							),
						})),
					},
			);
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
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussionId),
				(data) =>
					data
						? {
								...data,
								discussion: {
									...data.discussion,
									currentUserIsBlocked: member.isBlocked,
								},
							}
						: data,
			);
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							discussions: page.discussions.map((discussion) =>
								discussion.id === discussionId
									? {
											...discussion,
											currentUserIsBlocked: member.isBlocked,
										}
									: discussion,
							),
						})),
					},
			);
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
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussionId),
				(data) =>
					data
						? {
								...data,
								discussion: {
									...data.discussion,
									members: [
										...data.discussion.members,
										...users
											.filter(
												(user) =>
													addedUserIdsSet.has(user.id) &&
													!data.discussion.members.some(
														(member) => member.userId === user.id,
													),
											)
											.map((user) => ({
												userId: user.id,
												role: "MEMBER" as const,
												joinedAt: now,
												lastReadAt: now,
												user,
											})),
									],
								},
							}
						: data,
			);
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							discussions: page.discussions.map((discussion) =>
								discussion.id === discussionId
									? {
											...discussion,
											members: [
												...discussion.members,
												...users
													.filter(
														(user) =>
															addedUserIdsSet.has(user.id) &&
															!discussion.members.some(
																(member) => member.userId === user.id,
															),
													)
													.map((user) => ({
														userId: user.id,
														role: "MEMBER" as const,
														joinedAt: now,
														lastReadAt: now,
														user,
													})),
											],
										}
									: discussion,
							),
						})),
					},
			);
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
