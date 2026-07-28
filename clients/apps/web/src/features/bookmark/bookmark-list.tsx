import { IconBookmark } from "@tabler/icons-react";
import { useState } from "react";
import type { Post } from "@/features/post/common/post-item";
import { PostItem } from "@/features/post/common/post-item";

const INITIAL_BOOKMARKS: Post[] = [
	{
		id: "bm-1",
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
		id: "bm-2",
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

export function BookmarkList() {
	const [bookmarks, setBookmarks] = useState<Post[]>(INITIAL_BOOKMARKS);

	const handleBookmarkToggle = (postId: string) => {
		setBookmarks((prev) => prev.filter((p) => p.id !== postId));
	};

	return (
		<div className="divide-y divide-slate-200/80 dark:divide-slate-800">
			<div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
				<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
					<IconBookmark className="h-6 w-6 text-amber-500" />
					<span>Signets (Bookmarks)</span>
				</h1>
				<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
					Vos publications enregistrées pour plus tard
				</p>
			</div>

			{bookmarks.length === 0 ? (
				<div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
					<IconBookmark className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700" />
					<p className="font-medium text-slate-700 dark:text-slate-300">
						Aucun signet pour le moment
					</p>
					<p className="text-xs">
						Enregistrez des publications pour les retrouver facilement ici.
					</p>
				</div>
			) : (
				<div>
					{bookmarks.map((post) => (
						<PostItem
							key={post.id}
							post={post}
							onBookmarkToggle={handleBookmarkToggle}
						/>
					))}
				</div>
			)}
		</div>
	);
}
