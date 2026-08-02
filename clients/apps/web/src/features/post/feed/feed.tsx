import { useState } from "react";
import type { Post } from "../common/post.ts";
import { PostItem } from "../common/post-item";
import { CreatePostForm } from "../create-post/create-post-form";
import { useCreatePost } from "../create-post/use-create-post";

const FAKE_POSTS: Post[] = [
	{
		id: "post-1",
		author: {
			name: "insomnia_315",
			handle: "insomnia_315",
			avatar:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		},
		createdAt: "il y a 10h",
		content: "Tokyo apartment",
		images: [
			"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80",
		],
		stats: {
			comments: 23,
			reposts: 28,
			likes: 849,
			shares: 23,
		},
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
		content: "Amo los USB C por qué ya no necesitan energía los monitores 🖥️⚡",
		images: [
			"https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80",
		],
		stats: {
			comments: 45,
			reposts: 12,
			likes: 356,
			shares: 8,
		},
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
		images: [
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
		],
		stats: {
			comments: 18,
			reposts: 5,
			likes: 124,
			shares: 12,
		},
		isLiked: true,
		isBookmarked: true,
	},
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
		stats: {
			comments: 7,
			reposts: 12,
			likes: 89,
			shares: 4,
		},
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
		images: [
			"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1461749280684-dccae630c504?w=800&auto=format&fit=crop&q=80",
		],
		stats: {
			comments: 24,
			reposts: 31,
			likes: 240,
			shares: 18,
		},
		isLiked: false,
		isBookmarked: true,
	},
];

export function Feed() {
	const [posts, setPosts] = useState<Post[]>(FAKE_POSTS);
	const { mutate, isPending } = useCreatePost();

	const handleCreatePost = (input: { text: string; mediaUrls: string[] }) => {
		mutate(input, {
			onSuccess: (newPost) => {
				setPosts((prev) => [newPost, ...prev]);
			},
		});
	};

	return (
		<div className="divide-y divide-slate-200/80 dark:divide-slate-800">
			{/* Composer */}
			<CreatePostForm onSubmit={handleCreatePost} isPending={isPending} />

			{/* Feed Posts */}
			<div>
				{posts.map((post) => (
					<PostItem key={post.id} post={post} />
				))}
			</div>
		</div>
	);
}
