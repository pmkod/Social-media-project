import {
	IconPhoto,
	IconPlayerPlay,
	IconSend,
	IconVideo,
	IconX,
} from "@tabler/icons-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useCreatePost } from "@/features/post/create-post/use-create-post";

export type MediaPreviewItem = {
	url: string;
	type: "image" | "video";
};

const CURRENT_USER_AVATAR =
	"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

const MAX_MEDIA = 4;

function CreatePostForm() {
	const { mutate, isPending } = useCreatePost();

	const handleCreatePost = (input: { text: string; mediaUrls: string[] }) => {};
	const [text, setText] = useState("");
	const [previews, setPreviews] = useState<MediaPreviewItem[]>([]);
	const fileInputId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const pendingPreviewsRef = useRef<MediaPreviewItem[]>([]);

	useEffect(() => {
		pendingPreviewsRef.current = previews;
	}, [previews]);

	useEffect(() => {
		return () => {
			for (const item of pendingPreviewsRef.current) {
				URL.revokeObjectURL(item.url);
			}
		};
	}, []);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selected = event.target.files;
		if (!selected || selected.length === 0) return;

		const remainingSlots = MAX_MEDIA - previews.length;
		if (remainingSlots <= 0) return;

		const filesToProcess = Array.from(selected).slice(0, remainingSlots);
		const newPreviews: MediaPreviewItem[] = filesToProcess.map((file) => ({
			url: URL.createObjectURL(file),
			type: file.type.startsWith("video/") ? "video" : "image",
		}));

		setPreviews((prev) => [...prev, ...newPreviews]);

		// Reset the input so the same files can be selected again if removed.
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeMedia = (index: number) => {
		const removed = previews[index];
		URL.revokeObjectURL(removed.url);
		setPreviews((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!text.trim() && previews.length === 0) return;
		if (isPending) return;

		mutate(
			{
				text: text.trim(),
				mediaUrls: previews.map((item) => item.url),
			},
			{
				onSuccess: (newPost) => {},
			},
		);
		setText("");
		setPreviews([]);
	};

	const hasContent = Boolean(text.trim()) || previews.length > 0;
	const isMaxMediaReached = previews.length >= MAX_MEDIA;

	return (
		<form
			onSubmit={handleSubmit}
			className="pb-4 px-4 pt-6 border border-slate-200 rounded-xl"
		>
			<div className="flex gap-3">
				<img
					src={CURRENT_USER_AVATAR}
					alt="Votre avatar"
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
				/>

				<div className="flex-1 min-w-0 space-y-3">
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Quoi de neuf ?"
						rows={3}
						disabled={isPending}
						className="min-h-0 w-full resize-none font-normal placeholder:font-normal border-0 bg-transparent px-0 py-0 text-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-300 focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
					/>

					{previews.length > 0 ? (
						<div
							className={cn(
								"grid gap-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800",
								previews.length === 1 && "grid-cols-1 h-52",
								previews.length === 2 && "grid-cols-2 h-52",
								previews.length >= 3 && "grid-cols-2 grid-rows-2 h-72",
							)}
						>
							{previews.map((item, index) => (
								<div
									key={item.url}
									className={cn(
										"relative h-full w-full overflow-hidden bg-slate-900",
										previews.length === 3 && index === 0 ? "row-span-2" : "",
									)}
								>
									{item.type === "video" ? (
										<div className="relative h-full w-full">
											<video
												src={item.url}
												className="h-full w-full object-cover"
												muted
												loop
												autoPlay
												playsInline
											/>
											<div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
												<IconPlayerPlay className="h-3 w-3 fill-current" />
												<span>Vidéo</span>
											</div>
										</div>
									) : (
										<img
											src={item.url}
											alt={`Aperçu ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									)}
									<button
										type="button"
										onClick={() => removeMedia(index)}
										disabled={isPending}
										className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50 z-10"
										aria-label="Retirer le média"
									>
										<IconX className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
				<div className="flex items-center gap-2">
					<Button variant="ghost">
						<IconPhoto className="h-4 w-4" />
						Photo / vidéo
					</Button>
					{previews.length > 0 ? (
						<span className="text-xs text-slate-400 font-medium">
							{previews.length}/{MAX_MEDIA}
						</span>
					) : null}
				</div>

				<Button type="submit" disabled={!hasContent || isPending}>
					<IconSend className="h-4 w-4" />
					<span>Publier</span>
				</Button>
			</div>
		</form>
	);
}

export { CreatePostForm };
