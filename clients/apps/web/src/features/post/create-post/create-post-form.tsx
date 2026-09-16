import {
	RiCloseLine,
	RiEmotionHappyLine,
	RiImageLine,
	RiPlayFill,
	RiSendPlane2Line,
} from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmojiPickerPopover } from "@/core/components/ui/emoji-picker.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useSelectFiles } from "@/core/hooks/use-select-files.ts";
import { insertTextAtSelection } from "@/core/lib/text-selection.ts";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { m } from "@/paraglide/messages.js";
import {
	createPostSchema,
	POST_MAX_FILE_SIZE,
	POST_MAX_TEXT_LENGTH,
	POST_MEDIA_MIME_TYPES,
} from "./create-post.validation.ts";
import { useCreatePost } from "./use-create-post";
import { MediaPreviewModal } from "@/core/components/ui/media-preview-modal.tsx";

type CreatePostFormProps = {
	onSuccess?: () => void;
	onBusyChange?: (busy: boolean) => void;
	className?: string;
};

function CreatePostForm({
	onSuccess,
	onBusyChange,
	className,
}: CreatePostFormProps = {}) {
	const { mutate, isPending } = useCreatePost();
	const { selectFiles } = useSelectFiles();
	const { data: authenticatedUser } = useAuthenticatedUser();
	const [error, setError] = useState<string | null>(null);
	const [isValidatingMedia, setIsValidatingMedia] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const form = useForm({
		defaultValues: {
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
					text: value.text.trim(),
					medias: value.medias,
				},
				{
					onError: (error) => setError((error as Error).message),
					onSuccess: () => {
						form.reset();
						onSuccess?.();
					},
				},
			);
		},
	});

	const maxMedia = 4;
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
			accept: POST_MEDIA_MIME_TYPES.join(","),
			multiple: true,
		});
		if (!selectedFiles.length) return;
		setIsValidatingMedia(true);
		try {
			if (
				selectedFiles.some(
					(file) =>
						!POST_MEDIA_MIME_TYPES.includes(file.type) ||
						file.size === 0 ||
						file.size > POST_MAX_FILE_SIZE,
				)
			) {
				throw new Error(m.composer_invalid_media());
			}
			const currentMedias = form.getFieldValue("medias");
			if (selectedFiles.length > maxMedia - currentMedias.length)
				throw new Error(m.composer_too_many_files({ maxMedia }));
			form.setFieldValue("medias", [...currentMedias, ...selectedFiles]);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : m.composer_read_error(),
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

	const handleEmojiSelect = (emoji: string) => {
		const textarea = textareaRef.current;
		const insertion = insertTextAtSelection(
			form.getFieldValue("text"),
			emoji,
			{
				start: textarea?.selectionStart,
				end: textarea?.selectionEnd,
			},
			POST_MAX_TEXT_LENGTH,
		);

		if (!insertion) return;

		form.setFieldValue("text", insertion.value);
		requestAnimationFrame(() => {
			textarea?.focus();
			textarea?.setSelectionRange(insertion.caret, insertion.caret);
		});
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

	const hasContent = createPostSchema.safeParse({ text, medias }).success;
	const isMaxMediaReached = (medias || []).length >= maxMedia;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className={cn(
				"px-4 pt-6 pb-4 md:rounded-xl md:border md:border-border",
				className,
			)}
		>
			<div className="flex gap-3">
				<UserAvatar user={authenticatedUser?.user} size="lg" />

				<div className="flex-1 min-w-0 space-y-3">
					<form.Field name="text">
						{(field) => (
							<textarea
								ref={textareaRef}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-label={m.composer_text_label()}
								maxLength={POST_MAX_TEXT_LENGTH}
								placeholder={m.composer_placeholder()}
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
										aria-label={m.composer_media_preview({
											index: index + 1,
										})}
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
													<span>{m.composer_video()}</span>
												</div>
											</div>
										) : (
											<img
												src={item.url}
												alt={m.composer_image_preview({
													index: index + 1,
												})}
												className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
											/>
										)}
									</button>
									<button
										type="button"
										onClick={() => handleRemoveFile(index)}
										disabled={isBusy}
										className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors disabled:opacity-50 z-10 cursor-pointer flex items-center justify-center"
										aria-label={m.composer_remove_media()}
									>
										<RiCloseLine className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			{error ? (
				<p role="alert" className="mt-3 text-sm text-destructive">
					{error}
				</p>
			) : null}
			<div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<EmojiPickerPopover onEmojiSelect={handleEmojiSelect}>
						<Button
							type="button"
							variant="ghost"
							disabled={isBusy}
							aria-label={m.emoji_picker_trigger()}
						>
							<RiEmotionHappyLine className="h-4 w-4" />
							{m.emoji_picker_trigger()}
						</Button>
					</EmojiPickerPopover>
					<Button
						type="button"
						variant="ghost"
						onClick={handleMediaSelect}
						disabled={isBusy || isMaxMediaReached}
					>
						<RiImageLine className="h-4 w-4" />
						{isValidatingMedia
							? m.composer_checking_media()
							: m.composer_media()}
					</Button>
					{(medias || []).length > 0 ? (
						<span className="text-xs text-muted-foreground font-medium">
							{(medias || []).length}/{maxMedia}
						</span>
					) : null}
				</div>

				<Button type="submit" disabled={!hasContent || isBusy}>
					<RiSendPlane2Line className="h-4 w-4" />
					<span>{isPending ? m.composer_publishing() : m.action_post()}</span>
				</Button>
			</div>
		</form>
	);
}

export { CreatePostForm };
