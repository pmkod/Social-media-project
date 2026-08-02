import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import type { GetPostsInfiniteResult } from "../feed/use-get-infinite-posts.ts";

type ApiSinglePost = {
	id: string;
	authorId?: string;
	text: string;
	mediaUrls?: string[];
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
		mediaUrls: res.mediaUrls ?? [],
		stats: {
			comments: res._count?.comments ?? 0,
			reposts: 0,
			likes: res._count?.postLikes ?? 0,
			shares: 0,
		},
		isLiked: false,
		isBookmarked: false,
	};
};

export const useGetPostById = (postId: string) => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			try {
				return await fetchPostById(postId);
			} catch {
				// Fallback: try to find post in infinite feed query cache
				const infiniteData = queryClient.getQueryData<{
					pages: GetPostsInfiniteResult[];
				}>(["posts", "infinite"]);

				if (infiniteData) {
					for (const page of infiniteData.pages) {
						const found = page.data.find((p) => p.id === postId);
						if (found) return found;
					}
				}

				// Demo fallback post if not in cache
				return {
					id: postId,
					author: {
						name: "insomnia_315",
						handle: "insomnia_315",
						avatar:
							"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
					},
					createdAt: "il y a 10h",
					content: "Tokyo apartment 🏙️ Studio tour",
					mediaUrls: [
						"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=80",
						"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
						"https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80",
					],
					stats: { comments: 23, reposts: 28, likes: 849, shares: 23 },
					isLiked: false,
					isBookmarked: false,
				};
			}
		},
		enabled: Boolean(postId),
	});
};
