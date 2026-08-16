import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { feedQueryKey } from "../feed/feed.query-key.ts";
import type { FollowingFeedInfiniteResult } from "../feed/use-following-feed.ts";
import { postDetailsQueryKey } from "./post-detail.query-key.ts";

type ApiSinglePost = {
	id: string;
	authorId?: string;
	text: string;
	likesCount?: number;
	commentsCount?: number;
	medias?: Post["medias"];
	createdAt: string;
	updatedAt?: string;
	_count?: {
		comments: number;
		postLikes: number;
	};
};

const DEFAULT_AUTHOR = {
	name: "Utilisateur",
	handle: "utilisateur",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

const fetchPostById = async (postId: string): Promise<Post> => {
	const res = await httpClient.get(`posts/${postId}`).json<ApiSinglePost>();

	return {
		id: res.id,
		author: DEFAULT_AUTHOR,
		createdAt: new Date(res.createdAt).toLocaleDateString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		content: res.text,
		medias: res.medias ?? [],
		stats: {
			comments: res.commentsCount ?? res._count?.comments ?? 0,
			reposts: 0,
			likes: res.likesCount ?? res._count?.postLikes ?? 0,
			shares: 0,
		},
		isLiked: false,
		isBookmarked: false,
	};
};

export const usePost = (postId: string) => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: postDetailsQueryKey.build(postId),
		queryFn: async () => {
			try {
				return await fetchPostById(postId);
			} catch (error) {
				// Check if the post is already loaded in the following feed query cache
				const feedData = queryClient.getQueryData<{
					pages: FollowingFeedInfiniteResult[];
				}>(feedQueryKey.buildFollowing());

				if (feedData) {
					for (const page of feedData.pages) {
						const found = page.data.find((p) => p.id === postId);
						if (found) return found;
					}
				}

				throw error;
			}
		},
		enabled: Boolean(postId),
	});
};

export const usePostById = usePost;
