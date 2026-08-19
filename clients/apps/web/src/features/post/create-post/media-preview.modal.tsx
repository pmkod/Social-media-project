import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiCloseLine,
} from "@remixicon/react";
import { useCallback, useEffect, useState } from "react";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";

export type MediaItem = {
	url: string;
	type: "image" | "video";
	name?: string;
};

export type MediaPreviewModalProps = {
	items: MediaItem[];
	initialIndex?: number;
};

const MediaPreviewModal = create(
	({ items = [], initialIndex = 0 }: MediaPreviewModalProps) => {
		const modal = useModal();
		const [currentIndex, setCurrentIndex] = useState(initialIndex);

		const currentMedia = items[currentIndex];

		const handlePrev = useCallback(() => {
			setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
		}, [items.length]);

		const handleNext = useCallback(() => {
			setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
		}, [items.length]);

		useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (!modal.visible) return;
				if (e.key === "Escape") {
					modal.remove();
				} else if (e.key === "ArrowLeft") {
					handlePrev();
				} else if (e.key === "ArrowRight") {
					handleNext();
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [modal, handlePrev, handleNext]);

		if (!modal.visible || !currentMedia) return null;

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200">
				{/* Close button */}
				<button
					type="button"
					onClick={() => modal.remove()}
					className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
					aria-label="Close preview"
				>
					<RiCloseLine className="h-6 w-6" />
				</button>

				{/* Media navigation - Prev */}
				{items.length > 1 ? (
					<button
						type="button"
						onClick={handlePrev}
						className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
						aria-label="Previous media"
					>
						<RiArrowLeftSLine className="h-6 w-6" />
					</button>
				) : null}

				{/* Media display container */}
				<div className="relative max-w-5xl max-h-[85vh] w-full px-4 flex flex-col items-center justify-center select-none">
					{currentMedia.type === "video" ? (
						/* biome-ignore lint/a11y/useMediaCaption: Media preview player */
						<video
							src={currentMedia.url}
							controls
							autoPlay
							className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
						/>
					) : (
						<img
							src={currentMedia.url}
							alt={currentMedia.name || `Preview ${currentIndex + 1}`}
							className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
						/>
					)}

					{/* Counter / Information indicator */}
					{items.length > 1 ? (
						<div className="mt-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium border border-white/10">
							{currentIndex + 1} / {items.length}
						</div>
					) : null}
				</div>

				{/* Media navigation - Next */}
				{items.length > 1 ? (
					<button
						type="button"
						onClick={handleNext}
						className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
						aria-label="Next media"
					>
						<RiArrowRightSLine className="h-6 w-6" />
					</button>
				) : null}
			</div>
		);
	},
);

export { MediaPreviewModal };
