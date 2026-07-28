import {
	IconCalendar,
	IconListDetails,
	IconMoodSmile,
	IconPhoto,
	IconSend,
} from "@tabler/icons-react";
import { useState } from "react";
import type { Post } from "../common/post-item";
import { PostItem } from "../common/post-item";

const FAKE_POSTS: Post[] = [
	{
		id: "post-1",
		author: {
			name: "Sophie Martin",
			handle: "sophiem",
			avatar:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		},
		createdAt: "il y a 2h",
		content:
			"Ravi de lancer notre nouvelle interface sur Graphy ! Dites-moi ce que vous en pensez en commentaire 🚀🚀✨",
		image:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
		stats: {
			comments: 18,
			reposts: 5,
			likes: 124,
		},
		isLiked: true,
		isBookmarked: true,
	},
	{
		id: "post-2",
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
		},
		isLiked: false,
		isBookmarked: false,
	},
	{
		id: "post-3",
		author: {
			name: "Emma Laurent",
			handle: "emma_design",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		},
		createdAt: "il y a 6h",
		content:
			"Petite réflexion du jour sur l'accessibilité web : des contrastes élevés et une navigation clavier fluide changent radicalement l'expérience utilisateur.",
		image:
			"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
		stats: {
			comments: 24,
			reposts: 31,
			likes: 240,
		},
		isLiked: false,
		isBookmarked: true,
	},
];

export function Feed() {
	const [posts, setPosts] = useState<Post[]>(FAKE_POSTS);
	const [newPostText, setNewPostText] = useState("");

	const handleCreatePost = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPostText.trim()) return;

		const newPost: Post = {
			id: `post-${Date.now()}`,
			author: {
				name: "Vous",
				handle: "mon_compte",
				avatar:
					"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
			},
			createdAt: "À l'instant",
			content: newPostText,
			stats: {
				comments: 0,
				reposts: 0,
				likes: 0,
			},
			isLiked: false,
			isBookmarked: false,
		};

		setPosts([newPost, ...posts]);
		setNewPostText("");
	};

	return (
		<div className="divide-y divide-slate-200/80 dark:divide-slate-800">
			{/* Composer Header */}
			<div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
				<form onSubmit={handleCreatePost} className="space-y-3">
					<div className="flex gap-3">
						<img
							src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
							alt="Avatar"
							className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
						/>
						<textarea
							value={newPostText}
							onChange={(e) => setNewPostText(e.target.value)}
							placeholder="Quoi de neuf ?"
							rows={3}
							className="w-full resize-none bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
						/>
					</div>

					<div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
						<div className="flex items-center gap-1 text-slate-400">
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 transition-colors"
								title="Ajouter une image"
							>
								<IconPhoto className="h-5 w-5" />
							</button>
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 transition-colors"
								title="Ajouter un sondage"
							>
								<IconListDetails className="h-5 w-5" />
							</button>
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 transition-colors"
								title="Emojis"
							>
								<IconMoodSmile className="h-5 w-5" />
							</button>
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 transition-colors"
								title="Programmer"
							>
								<IconCalendar className="h-5 w-5" />
							</button>
						</div>

						<button
							type="submit"
							disabled={!newPostText.trim()}
							className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs transition-colors"
						>
							<IconSend className="h-3.5 w-3.5" />
							<span>Publier</span>
						</button>
					</div>
				</form>
			</div>

			{/* Feed Posts */}
			<div>
				{posts.map((post) => (
					<PostItem key={post.id} post={post} />
				))}
			</div>
		</div>
	);
}
