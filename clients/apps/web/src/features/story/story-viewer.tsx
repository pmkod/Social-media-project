import {
	RiArrowLeftLine,
	RiArrowRightLine,
	RiCloseLine,
} from "@remixicon/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import {
	buildImageUrl,
	buildVideoUrl,
} from "@/features/post/post-media.functions.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type { StoryGroup } from "./common/story.ts";
import { useMarkStoryViewed } from "./use-mark-story-viewed.ts";

type StoryViewerProps = {
	groups: StoryGroup[];
	initialGroupIndex: number;
	onOpenChange: (open: boolean) => void;
};

function formatStoryAge(createdAt: string) {
	const elapsedMinutes = Math.max(
		0,
		Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000),
	);
	if (elapsedMinutes < 1) return "now";
	if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) return `${elapsedHours}h`;
	return "yesterday";
}

function StoryViewer({
	groups,
	initialGroupIndex,
	onOpenChange,
}: StoryViewerProps) {
	const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
	const [storyIndex, setStoryIndex] = useState(0);
	const { mutate: markStoryViewed } = useMarkStoryViewed();
	const group = groups[groupIndex];
	const story = group?.stories[storyIndex];
	const currentStoryId = story?.id;

	const close = useCallback(() => onOpenChange(false), [onOpenChange]);
	const goNext = useCallback(() => {
		if (!group) return;
		if (storyIndex < group.stories.length - 1) {
			setStoryIndex((current) => current + 1);
			return;
		}
		if (groupIndex < groups.length - 1) {
			setGroupIndex((current) => current + 1);
			setStoryIndex(0);
			return;
		}
		close();
	}, [close, group, groupIndex, groups.length, storyIndex]);

	const goPrevious = useCallback(() => {
		if (storyIndex > 0) {
			setStoryIndex((current) => current - 1);
			return;
		}
		if (groupIndex > 0) {
			const previousGroup = groups[groupIndex - 1];
			setGroupIndex((current) => current - 1);
			setStoryIndex((previousGroup?.stories.length ?? 1) - 1);
		}
	}, [groupIndex, groups, storyIndex]);

	useEffect(() => {
		if (currentStoryId) markStoryViewed(currentStoryId);
	}, [currentStoryId, markStoryViewed]);

	useEffect(() => {
		if (!story || story.mediaType === "VIDEO") return;
		const timeout = window.setTimeout(goNext, 5_000);
		return () => window.clearTimeout(timeout);
	}, [goNext, story]);

	const mediaUrl = useMemo(() => {
		if (!story) return "";
		return story.mediaType === "VIDEO"
			? buildVideoUrl(story.mediaFile.filename)
			: buildImageUrl(story.mediaFile.filename);
	}, [story]);

	if (!group || !story) return null;
	const authorName =
		group.author?.fullName || `@${group.author?.username ?? "user"}`;

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent
				size="xl"
				showCloseButton={false}
				className="h-[min(48rem,calc(100dvh-2rem))] max-w-md border-white/10 bg-zinc-950 p-0 text-white"
			>
				<DialogTitle className="sr-only">Story by {authorName}</DialogTitle>
				<DialogBody className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-950">
					<div className="absolute inset-x-4 top-4 z-20 flex gap-1">
						{group.stories.map((item, index) => (
							<div
								key={item.id}
								className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
							>
								<div
									className={`h-full rounded-full bg-white transition-[width] duration-300 ${
										index < storyIndex
											? "w-full"
											: index === storyIndex
												? "w-1/2"
												: "w-0"
									}`}
								/>
							</div>
						))}
					</div>

					<div className="absolute inset-x-4 top-9 z-20 flex items-center gap-3">
						<UserAvatar user={group.author ?? undefined} size="sm" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">{authorName}</p>
							<p className="text-xs text-white/60">
								{formatStoryAge(story.createdAt)}
							</p>
						</div>
						<button
							type="button"
							onClick={close}
							className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
							aria-label="Close story viewer"
						>
							<RiCloseLine className="size-6" />
						</button>
					</div>

					<div className="flex min-h-0 flex-1 items-center justify-center px-2 py-20">
						{story.mediaType === "VIDEO" ? (
							<video
								key={story.id}
								src={mediaUrl}
								autoPlay
								controls
								muted
								playsInline
								onEnded={goNext}
								className="max-h-full max-w-full rounded-xl object-contain"
							/>
						) : (
							<img
								key={story.id}
								src={mediaUrl}
								alt={`Story by ${authorName}`}
								className="max-h-full max-w-full rounded-xl object-contain"
							/>
						)}
					</div>

					<button
						type="button"
						onClick={goPrevious}
						className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-30"
						disabled={groupIndex === 0 && storyIndex === 0}
						aria-label="Previous story"
					>
						<RiArrowLeftLine className="size-5" />
					</button>
					<button
						type="button"
						onClick={goNext}
						className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
						aria-label="Next story"
					>
						<RiArrowRightLine className="size-5" />
					</button>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}

export { StoryViewer };
