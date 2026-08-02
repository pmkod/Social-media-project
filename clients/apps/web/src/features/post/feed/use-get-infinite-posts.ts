import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";

type ApiPostItem = {
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

type GetPostsResponse = {
	data: ApiPostItem[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type GetPostsInfiniteResult = {
	data: Post[];
	meta: GetPostsResponse["meta"];
};

const DEFAULT_AUTHOR = {
	name: "Utilisateur",
	handle: "utilisateur",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

const MOCK_POSTS_PAGES: Record<number, Post[]> = {
	1: [
		{
			id: "post-1",
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
		},
		{
			id: "post-2",
			author: {
				name: "terrano_geek",
				handle: "terrano_geek",
				avatar:
					"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "il y a 23h",
			content:
				"Amo los USB C por qué ya no necesitan energía los monitores 🖥️⚡",
			mediaUrls: [
				"https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80",
			],
			stats: { comments: 45, reposts: 12, likes: 356, shares: 8 },
			isLiked: false,
			isBookmarked: false,
		},
		{
			id: "post-3",
			author: {
				name: "Sophie Martin",
				handle: "sophiem",
				avatar:
					"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "il y a 2h",
			content:
				"Ravi de lancer notre nouvelle interface sur Graphy ! Dites-moi ce que vous en pensez en commentaire 🚀🚀✨",
			mediaUrls: [
				"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
			],
			stats: { comments: 18, reposts: 5, likes: 124, shares: 12 },
			isLiked: true,
			isBookmarked: true,
		},
	],
	2: [
		{
			id: "post-4",
			author: {
				name: "Alexandre Dubois",
				handle: "alex_dev",
				avatar:
					"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "il y a 4h",
			content:
				"TypeScript 5.5 apporte tellement d'améliorations pour le typage des prédicats de types ! Qui d'autre a déjà migré ?",
			mediaUrls: [],
			stats: { comments: 7, reposts: 12, likes: 89, shares: 4 },
			isLiked: false,
			isBookmarked: false,
		},
		{
			id: "post-5",
			author: {
				name: "Emma Laurent",
				handle: "emma_design",
				avatar:
					"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "il y a 6h",
			content:
				"Petite réflexion du jour sur l'accessibilité web : des contrastes élevés et une navigation clavier fluide changent radicalement l'expérience utilisateur.",
			mediaUrls: [
				"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
				"https://images.unsplash.com/photo-1461749280684-dccae630c504?w=800&auto=format&fit=crop&q=80",
			],
			stats: { comments: 24, reposts: 31, likes: 240, shares: 18 },
			isLiked: false,
			isBookmarked: true,
		},
	],
	3: [
		{
			id: "post-6",
			author: {
				name: "Lucas Bernard",
				handle: "lucas_b",
				avatar:
					"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "il y a 12h",
			content:
				"Session code nocturne ☕ 💻 Qu'est-ce que vous buvez pour rester concentré ?",
			mediaUrls: [
				"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
			],
			stats: { comments: 12, reposts: 3, likes: 78, shares: 2 },
			isLiked: false,
			isBookmarked: false,
		},
	],
};

const fetchPostsPage = async ({
	pageParam = 1,
}: {
	pageParam?: number;
}): Promise<GetPostsInfiniteResult> => {
	try {
		const res = await httpClient
			.get("posts", {
				searchParams: {
					page: pageParam.toString(),
					limit: "5",
				},
			})
			.json<GetPostsResponse>();

		const posts: Post[] = res.data.map((item) => ({
			id: item.id,
			author: DEFAULT_AUTHOR,
			createdAt: new Date(item.createdAt).toLocaleDateString("fr-FR", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			content: item.text,
			mediaUrls: item.mediaUrls ?? [],
			stats: {
				comments: item._count?.comments ?? 0,
				reposts: 0,
				likes: item._count?.postLikes ?? 0,
				shares: 0,
			},
			isLiked: false,
			isBookmarked: false,
		}));

		return {
			data: posts,
			meta: res.meta,
		};
	} catch {
		// Fallback to mock pages if API server is offline
		const page = pageParam;
		const mockData = MOCK_POSTS_PAGES[page] ?? [];
		const totalPages = 3;

		return {
			data: mockData,
			meta: {
				total: 6,
				page,
				limit: 5,
				totalPages,
			},
		};
	}
};

export const useGetInfinitePosts = () => {
	return useInfiniteQuery({
		queryKey: ["posts", "infinite"],
		queryFn: ({ pageParam }) => fetchPostsPage({ pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.meta.page < lastPage.meta.totalPages) {
				return lastPage.meta.page + 1;
			}
			return undefined;
		},
	});
};
