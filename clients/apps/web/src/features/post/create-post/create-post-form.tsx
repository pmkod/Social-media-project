import {
	RiCloseLine,
	RiImageLine,
	RiPlayFill,
	RiSendPlane2Line,
} from "@remixicon/react";
import { useForm, useSelector, useStore } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useSelectFiles } from "@/core/hooks/use-select-files.ts";
import { cn } from "@/core/lib/utils.ts";
import { MediaPreviewModal } from "./media-preview.modal.tsx";
import { useCreatePost } from "./use-create-post";

const CURRENT_USER_AVATAR =
	"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

const MAX_MEDIA = 4;

const createPostSchema = z
	.object({
		text: z.string(),
		medias: z.array(z.custom<File>((val) => val instanceof File)),
	})
	.refine((data) => data.text.trim().length > 0 || data.medias.length > 0, {
		message: "Le post doit contenir du texte ou au moins un fichier média",
	});

function CreatePostForm() {
	const { mutate, isPending } = useCreatePost();
	const { selectFiles } = useSelectFiles();

	const form = useForm({
		defaultValues: {
			text: "",
			medias: [] as File[],
		},
		validators: {
			onSubmit: createPostSchema,
		},
		onSubmit: async ({ value }) => {
			if (isPending) return;

			mutate(
				{
					text: value.text.trim(),
					medias: value.medias,
				},
				{
					onSuccess: () => {
						form.reset();
					},
				},
			);
		},
	});

	const medias = useSelector(form.store, (state) => state.values.medias);
	const text = useSelector(form.store, (state) => state.values.text);

	// Generate preview object URLs for selected media files
	const mediaPreviews = useMemo(() => {
		return (medias || []).map((file) => ({
			file,
			url: URL.createObjectURL(file),
			type: file.type.startsWith("video/")
				? ("video" as const)
				: ("image" as const),
		}));
	}, [medias]);

	// Clean up object URLs when mediaPreviews change or unmount
	useEffect(() => {
		return () => {
			for (const item of mediaPreviews) {
				URL.revokeObjectURL(item.url);
			}
		};
	}, [mediaPreviews]);

	const handleMediaSelect = async () => {
		const selectedFiles = await selectFiles({ accept: "image/*,video/*" });
		if (!selectedFiles || selectedFiles.length === 0) return;

		const currentMedias = form.getFieldValue("medias") || [];
		const remainingSlots = MAX_MEDIA - currentMedias.length;
		if (remainingSlots <= 0) return;

		const filesToAdd = selectedFiles.slice(0, remainingSlots);
		form.setFieldValue("medias", [...currentMedias, ...filesToAdd]);
	};

	const handleRemoveFile = (index: number) => {
		const currentMedias = form.getFieldValue("medias") || [];
		form.setFieldValue(
			"medias",
			currentMedias.filter((_, i) => i !== index),
		);
	};

	const handleOpenPreviewModal = (index: number) => {
		const items = mediaPreviews.map((p) => ({
			url: p.url,
			type: p.type,
			name: p.file.name,
		}));
		NiceModal.show(MediaPreviewModal, {
			items,
			initialIndex: index,
		});
	};

	const hasContent = Boolean((text || "").trim()) || (medias || []).length > 0;
	const isMaxMediaReached = (medias || []).length >= MAX_MEDIA;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="pb-4 px-4 pt-6 border border-slate-200 rounded-xl"
		>
			<div className="flex gap-3">
				<img
					src={CURRENT_USER_AVATAR}
					alt="Votre avatar"
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
				/>

				<div className="flex-1 min-w-0 space-y-3">
					<form.Field name="text">
						{(field) => (
							<textarea
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Quoi de neuf ?"
								rows={3}
								disabled={isPending}
								className="min-h-0 w-full resize-none font-normal placeholder:font-normal border-0 bg-transparent px-0 py-0 text-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-300 focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
							/>
						)}
					</form.Field>

					{mediaPreviews.length > 0 ? (
						<div className={cn("flex gap-1 flex-wrap ")}>
							{mediaPreviews.map((item, index) => (
								<div
									key={`${item.file.name}-${item.file.lastModified}-${item.file.size}`}
									className={
										"relative size-24 rounded-2xl overflow-hidden bg-slate-900 group"
									}
								>
									<button
										type="button"
										onClick={() => handleOpenPreviewModal(index)}
										className="h-full w-full text-left border-0 p-0 cursor-pointer block relative"
										aria-label={`Aperçu média ${index + 1}`}
									>
										{item.type === "video" ? (
											<div className="relative h-full w-full">
												<video
													src={item.url}
													className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
													muted
													loop
													autoPlay
													playsInline
												/>
												<div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
													<RiPlayFill className="h-3 w-3 fill-current" />
													<span>Vidéo</span>
												</div>
											</div>
										) : (
											<img
												src={item.url}
												alt={`Aperçu ${index + 1}`}
												className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
											/>
										)}
									</button>
									<button
										type="button"
										onClick={() => handleRemoveFile(index)}
										disabled={isPending}
										className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50 z-10 cursor-pointer flex items-center justify-center"
										aria-label="Retirer le média"
									>
										<RiCloseLine className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						onClick={handleMediaSelect}
						disabled={isPending || isMaxMediaReached}
					>
						<RiImageLine className="h-4 w-4" />
						Médias
					</Button>
					{(medias || []).length > 0 ? (
						<span className="text-xs text-slate-400 font-medium">
							{(medias || []).length}/{MAX_MEDIA}
						</span>
					) : null}
				</div>

				<Button type="submit" disabled={!hasContent || isPending}>
					<RiSendPlane2Line className="h-4 w-4" />
					<span>{isPending ? "Publication..." : "Publier"}</span>
				</Button>
			</div>
		</form>
	);
}

export { CreatePostForm };
