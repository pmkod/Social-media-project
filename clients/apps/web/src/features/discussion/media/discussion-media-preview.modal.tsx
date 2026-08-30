import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiFileLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { cn } from "@/core/lib/utils.ts";
import type { MessageMedia } from "../common/discussion.ts";

type DiscussionMediaPreviewModalProps = {
	items: MessageMedia[];
	initialIndex?: number;
};

const getMediaLabel = (media: MessageMedia) =>
	media.fileName ||
	(media.type === "IMAGE"
		? "Image"
		: media.type === "VIDEO"
			? "Vidéo"
			: media.type === "AUDIO"
				? "Audio"
				: "Fichier");

function DiscussionMediaTile({
	media,
	className,
	onClick,
}: {
	media: MessageMedia;
	className?: string;
	onClick?: () => void;
}) {
	const content =
		media.type === "IMAGE" ? (
			<img
				src={media.url}
				alt={getMediaLabel(media)}
				className="size-full object-cover"
				loading="lazy"
			/>
		) : media.type === "VIDEO" ? (
			<video
				src={media.url}
				className="size-full object-cover"
				preload="metadata"
				muted
			/>
		) : (
			<div className="flex size-full flex-col items-center justify-center gap-2 bg-muted p-3 text-center">
				<RiFileLine className="size-7 text-primary" />
				<span className="line-clamp-2 text-xs font-medium">
					{getMediaLabel(media)}
				</span>
			</div>
		);

	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Ouvrir ${getMediaLabel(media)}`}
			className={cn(
				"relative aspect-square overflow-hidden rounded-xl border border-border bg-muted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
		>
			{content}
		</button>
	) : (
		<div className={className}>{content}</div>
	);
}

const DiscussionMediaPreviewModal = create<DiscussionMediaPreviewModalProps>(
	({ items, initialIndex = 0 }) => {
		const modal = useModal();
		const [index, setIndex] = useState(() =>
			Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0)),
		);
		const item = items[index];

		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === "ArrowLeft") {
					setIndex((current) => Math.max(0, current - 1));
				}
				if (event.key === "ArrowRight") {
					setIndex((current) => Math.min(items.length - 1, current + 1));
				}
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [items.length]);

		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open) modal.remove();
				}}
			>
				<DialogContent size="xl" className="h-[min(48rem,calc(100dvh-2rem))]">
					<DialogHeader>
						<DialogTitle className="pr-10">
							{item ? getMediaLabel(item) : "Média"}
						</DialogTitle>
					</DialogHeader>
					<DialogBody className="relative flex items-center justify-center bg-black/95 p-4">
						{item ? (
							item.type === "IMAGE" ? (
								<img
									src={item.url}
									alt={getMediaLabel(item)}
									className="max-h-full max-w-full object-contain"
								/>
							) : item.type === "VIDEO" ? (
								// biome-ignore lint/a11y/useMediaCaption: The chat media contract does not provide a captions file.
								<video
									src={item.url}
									className="max-h-full max-w-full"
									controls
									autoPlay
								/>
							) : item.type === "AUDIO" ? (
								// biome-ignore lint/a11y/useMediaCaption: The chat media contract does not provide a transcript file.
								<audio
									src={item.url}
									controls
									autoPlay
									className="w-full max-w-lg"
								/>
							) : (
								<a
									href={item.url}
									target="_blank"
									rel="noreferrer"
									className="rounded-xl bg-background px-5 py-3 font-medium text-foreground"
								>
									Ouvrir {getMediaLabel(item)}
								</a>
							)
						) : (
							<p className="text-sm text-white/70">Média indisponible</p>
						)}

						{items.length > 1 ? (
							<>
								<IconButton
									type="button"
									variant="secondary"
									disabled={index === 0}
									onClick={() => setIndex((current) => current - 1)}
									aria-label="Média précédent"
									className="absolute left-3 rounded-full"
								>
									<RiArrowLeftSLine />
								</IconButton>
								<IconButton
									type="button"
									variant="secondary"
									disabled={index === items.length - 1}
									onClick={() => setIndex((current) => current + 1)}
									aria-label="Média suivant"
									className="absolute right-3 rounded-full"
								>
									<RiArrowRightSLine />
								</IconButton>
							</>
						) : null}
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	},
);

export { DiscussionMediaPreviewModal, DiscussionMediaTile, getMediaLabel };
