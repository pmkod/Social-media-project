import {
	RiCloseLine,
	RiImageLine,
	RiPlayCircleLine,
	RiPlayFill,
	RiSendPlane2Line,
} from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { isHTTPError } from "ky";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useSelectFiles } from "@/core/hooks/use-select-files.ts";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type { PostType } from "../common/post.ts";
import {
	checkChillzDuration,
	createPostSchema,
	POST_MAX_FILE_SIZE,
	POST_MEDIA_MIME_TYPES,
} from "./create-post.validation.ts";
import { MediaPreviewModal } from "./media-preview.modal.tsx";
import { useCreatePost } from "./use-create-post";

type CreatePostFormProps = {
	type?: PostType;
	onSuccess?: () => void;
	onBusyChange?: (busy: boolean) => void;
};

function CreatePostForm({
	type: initialType,
	onSuccess,
	onBusyChange,
}: CreatePostFormProps = {}) {
	const { mutate, isPending } = useCreatePost();
	const { selectFiles } = useSelectFiles();
	const { data: authenticatedUser } = useAuthenticatedUser();
	const [error, setError] = useState<string | null>(null);
	const [isValidatingMedia, setIsValidatingMedia] = useState(false);

	const form = useForm({
		defaultValues: {
			type: initialType ?? ("POST" as PostType),
			text: "",
			medias: [] as File[],
		},
		validators: {
			onSubmit: createPostSchema,
		},
		onSubmit: async ({ value }) => {
			if (isPending || isValidatingMedia) return;
			setError(null);

			mutate(
				{
					type: value.type,
					text: value.text.trim(),
					medias: value.medias,
				},
				{
					onError: (error) =>
						setError(
							isHTTPError(error) &&
								typeof error.data === "object" &&
								error.data !== null &&
								"message" in error.data &&
								typeof error.data.message === "string"
								? error.data.message
								: "Unable to publish. Please try again. Your draft has been kept.",
						),
					onSuccess: () => {
						form.reset();
						onSuccess?.();
					},
				},
			);
		},
	});

	const type = useSelector(form.store, (state) => state.values.type);
	const isChillz = type === "CHILLZ";
	const maxMedia = isChillz ? 1 : 4;
	const isBusy = isPending || isValidatingMedia;
	useEffect(() => {
		onBusyChange?.(isBusy);
	}, [isBusy, onBusyChange]);
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
		setError(null);
		const selectedFiles = await selectFiles({
			accept: (isChillz
				? POST_MEDIA_MIME_TYPES.filter((mime) => mime.startsWith("video/"))
				: POST_MEDIA_MIME_TYPES
			).join(","),
			multiple: !isChillz,
		});
		if (!selectedFiles.length) return;
		setIsValidatingMedia(true);
		try {
			if (
				selectedFiles.some(
					(file) =>
						!POST_MEDIA_MIME_TYPES.includes(file.type) ||
						file.size === 0 ||
						file.size > POST_MAX_FILE_SIZE ||
						(isChillz && !file.type.startsWith("video/")),
				)
			) {
				throw new Error(
					"Choose a supported file up to 20 MB. Chillz require a video.",
				);
			}
			const currentMedias = form.getFieldValue("medias");
			if (selectedFiles.length > maxMedia - currentMedias.length)
				throw new Error(
					`You can attach up to ${maxMedia} ${isChillz ? "video" : "files"}.`,
				);
			if (isChillz) await checkChillzDuration(selectedFiles[0]);
			form.setFieldValue("medias", [...currentMedias, ...selectedFiles]);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Unable to read this file.",
			);
		} finally {
			setIsValidatingMedia(false);
		}
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

	const hasContent = createPostSchema.safeParse({ type, text, medias }).success;
	const isMaxMediaReached = (medias || []).length >= maxMedia;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="pb-4 px-4 pt-6 border border-border rounded-xl"
		>
			{!initialType ? (
				<fieldset className="mb-4 flex gap-2">
					<legend className="sr-only">Publication type</legend>
					{(["POST", "CHILLZ"] as const).map((option) => (
						<Button
							key={option}
							type="button"
							variant={type === option ? "secondary" : "ghost"}
							aria-pressed={type === option}
							disabled={isBusy}
							onClick={() => {
								form.setFieldValue("type", option);
								form.setFieldValue("medias", []);
								setError(null);
							}}
						>
							{option === "CHILLZ" ? (
								<RiPlayCircleLine className="size-4" />
							) : null}
							{option === "CHILLZ" ? "Chillz" : "Post"}
						</Button>
					))}
				</fieldset>
			) : null}
			<div className="flex gap-3">
				<UserAvatar user={authenticatedUser?.user} size="lg" />

				<div className="flex-1 min-w-0 space-y-3">
					<form.Field name="text">
						{(field) => (
							<textarea
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-label={isChillz ? "Chillz caption" : "Post text"}
								maxLength={5000}
								placeholder={
									isChillz ? "Give your Chillz a caption…" : "What's happening?"
								}
								rows={3}
								disabled={isBusy}
								className="min-h-0 w-full resize-none font-normal placeholder:font-normal border-0 bg-transparent px-0 py-0 text-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
							/>
						)}
					</form.Field>

					{mediaPreviews.length > 0 ? (
						<div className={cn("flex gap-1 flex-wrap ")}>
							{mediaPreviews.map((item, index) => (
								<div
									key={`${item.file.name}-${item.file.lastModified}-${item.file.size}`}
									className={
										"relative size-24 rounded-2xl overflow-hidden bg-muted group"
									}
								>
									<button
										type="button"
										onClick={() => handleOpenPreviewModal(index)}
										className="h-full w-full text-left border-0 p-0 cursor-pointer block relative"
										aria-label={`Media preview ${index + 1}`}
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
													<span>Video</span>
												</div>
											</div>
										) : (
											<img
												src={item.url}
												alt={`Preview ${index + 1}`}
												className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
											/>
										)}
									</button>
									<button
										type="button"
										onClick={() => handleRemoveFile(index)}
										disabled={isBusy}
										className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50 z-10 cursor-pointer flex items-center justify-center"
										aria-label="Remove media"
									>
										<RiCloseLine className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			{isChillz ? (
				<p className="mt-3 text-xs text-muted-foreground">
					One video. Up to 90 seconds and 20 MB. Make it a Chillz.
				</p>
			) : null}
			{error ? (
				<p role="alert" className="mt-3 text-sm text-destructive">
					{error}
				</p>
			) : null}
			<div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						onClick={handleMediaSelect}
						disabled={isBusy || isMaxMediaReached}
					>
						<RiImageLine className="h-4 w-4" />
						{isValidatingMedia ? "Checking…" : isChillz ? "Add video" : "Media"}
					</Button>
					{(medias || []).length > 0 ? (
						<span className="text-xs text-muted-foreground font-medium">
							{(medias || []).length}/{maxMedia}
						</span>
					) : null}
				</div>

				<Button type="submit" disabled={!hasContent || isBusy}>
					<RiSendPlane2Line className="h-4 w-4" />
					<span>
						{isPending ? "Publishing…" : isChillz ? "Publish Chillz" : "Post"}
					</span>
				</Button>
			</div>
		</form>
	);
}

export { CreatePostForm };
