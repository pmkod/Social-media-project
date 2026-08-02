import { IconPhoto, IconSend, IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { cn } from "@/core/lib/utils.ts";

type CreatePostFormProps = {
	onSubmit: (input: { text: string; mediaUrls: string[] }) => void;
	isPending?: boolean;
};

const CURRENT_USER_AVATAR =
	"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

function CreatePostForm({ onSubmit, isPending = false }: CreatePostFormProps) {
	const [text, setText] = useState("");
	const [previews, setPreviews] = useState<string[]>([]);
	const fileInputId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const pendingPreviewsRef = useRef<string[]>([]);

	useEffect(() => {
		pendingPreviewsRef.current = previews;
	}, [previews]);

	useEffect(() => {
		return () => {
			for (const url of pendingPreviewsRef.current) {
				URL.revokeObjectURL(url);
			}
		};
	}, []);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selected = event.target.files;
		if (!selected || selected.length === 0) return;

		const newFiles = Array.from(selected);
		const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

		setPreviews((prev) => [...prev, ...newPreviews]);

		// Reset the input so the same files can be selected again if removed.
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeImage = (index: number) => {
		const removed = previews[index];
		URL.revokeObjectURL(removed);
		setPreviews((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!text.trim() && previews.length === 0) return;
		if (isPending) return;

		onSubmit({ text: text.trim(), mediaUrls: previews });
		setText("");
		setPreviews([]);
	};

	const hasContent = Boolean(text.trim()) || previews.length > 0;

	return (
		<form
			onSubmit={handleSubmit}
			className="p-4 border-b border-slate-200/80 dark:border-slate-800"
		>
			<div className="flex gap-3">
				<img
					src={CURRENT_USER_AVATAR}
					alt="Votre avatar"
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
				/>

				<div className="flex-1 min-w-0 space-y-3">
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Quoi de neuf ?"
						rows={3}
						disabled={isPending}
						className="min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
					/>

					{previews.length > 0 ? (
						<div
							className={cn(
								"grid gap-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800",
								previews.length === 1 && "grid-cols-1 h-48",
								previews.length === 2 && "grid-cols-2 h-48",
								previews.length >= 3 && "grid-cols-2 grid-rows-2 h-72",
							)}
						>
							{previews.length > 4
								? previews.slice(0, 3).map((src, index) => (
										<div key={src} className="relative h-full w-full">
											<img
												src={src}
												alt={`Aperçu ${index + 1}`}
												className="h-full w-full object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												disabled={isPending}
												className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
												aria-label="Retirer l'image"
											>
												<IconX className="h-3.5 w-3.5" />
											</button>
										</div>
									))
								: previews.map((src, index) => (
										<div
											key={src}
											className={cn(
												"relative h-full w-full",
												previews.length === 3 && index === 0
													? "row-span-2"
													: "",
											)}
										>
											<img
												src={src}
												alt={`Aperçu ${index + 1}`}
												className="h-full w-full object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												disabled={isPending}
												className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
												aria-label="Retirer l'image"
											>
												<IconX className="h-3.5 w-3.5" />
											</button>
										</div>
									))}
							{previews.length > 4 ? (
								<div className="relative h-full w-full">
									<img
										src={previews[3]}
										alt="Aperçu"
										className="h-full w-full object-cover"
									/>
									<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-sm font-semibold text-white">
										+{previews.length - 4}
									</div>
									<button
										type="button"
										onClick={() => removeImage(3)}
										disabled={isPending}
										className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
										aria-label="Retirer l'image"
									>
										<IconX className="h-3.5 w-3.5" />
									</button>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
				<div className="flex items-center gap-1">
					<input
						ref={fileInputRef}
						id={fileInputId}
						type="file"
						accept="image/*"
						multiple
						onChange={handleFileChange}
						disabled={isPending}
						className="sr-only"
					/>
					<label
						htmlFor={fileInputId}
						className={cn(
							"inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-sky-500 transition-colors hover:bg-sky-500/10",
							isPending && "pointer-events-none opacity-50",
						)}
						title="Ajouter une image"
					>
						<IconPhoto className="h-5 w-5" />
					</label>
				</div>

				<Button
					type="submit"
					disabled={!hasContent || isPending}
					className="rounded-full px-5"
				>
					<IconSend className="h-4 w-4" />
					<span>Publier</span>
				</Button>
			</div>
		</form>
	);
}

export { CreatePostForm };
export type { CreatePostFormProps };
