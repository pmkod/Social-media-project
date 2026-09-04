import { RiAddLine, RiRefreshLine } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type { StoryGroup } from "./common/story.ts";
import { CreateStoryDialog } from "./create-story/create-story-dialog.tsx";
import { StoryViewer } from "./story-viewer.tsx";
import { useStories } from "./use-stories.ts";

function StoryCircle({
	group,
	onClick,
}: {
	group: StoryGroup;
	onClick: () => void;
}) {
	const allViewed = group.stories.every(
		(story) => story.isViewedByAuthenticatedUser,
	);
	const displayName =
		group.author?.fullName || `@${group.author?.username ?? "user"}`;

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={`Open ${displayName}'s story`}
		>
			<span
				className={cn(
					"rounded-full p-[3px]",
					allViewed
						? "bg-muted-foreground/30"
						: "bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600",
				)}
			>
				<span className="block rounded-full bg-background p-[2px]">
					<UserAvatar user={group.author ?? undefined} size="xl" />
				</span>
			</span>
			<span className="max-w-full truncate text-xs text-foreground">
				{displayName}
			</span>
		</button>
	);
}

function CreateStoryCard({ onClick }: { onClick: () => void }) {
	const { data } = useAuthenticatedUser();
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label="Add a story"
		>
			<span className="relative rounded-full border-2 border-dashed border-primary/60 p-[3px]">
				<span className="block rounded-full bg-background p-[2px]">
					<UserAvatar user={data?.user} size="xl" />
				</span>
				<span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
					<RiAddLine className="size-4" />
				</span>
			</span>
			<span className="max-w-full truncate text-xs font-medium">
				Your story
			</span>
		</button>
	);
}

function StoriesTray() {
	const { data, isLoading, isError } = useStories();
	const { data: authenticatedUser } = useAuthenticatedUser();
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);
	const groups = data?.stories ?? [];
	const visibleGroups = groups.filter(
		(group) => group.authorId !== authenticatedUser?.user.id,
	);

	return (
		<>
			<section aria-label="Stories">
				<div className="flex gap-3 overflow-x-auto pb-1">
					<CreateStoryCard onClick={() => setIsComposerOpen(true)} />
					{isLoading
						? [0, 1, 2].map((item) => (
								<div
									key={item}
									className="flex w-20 shrink-0 flex-col items-center gap-1.5"
								>
									<div className="size-[4.5rem] animate-pulse rounded-full bg-muted" />
									<div className="h-3 w-14 animate-pulse rounded bg-muted" />
								</div>
							))
						: visibleGroups.map((group, index) => (
								<StoryCircle
									key={group.authorId}
									group={group}
									onClick={() => setViewerGroupIndex(index)}
								/>
							))}
				</div>
			</section>

			<CreateStoryDialog
				open={isComposerOpen}
				onOpenChange={setIsComposerOpen}
			/>
			{viewerGroupIndex !== null ? (
				<StoryViewer
					groups={visibleGroups}
					initialGroupIndex={viewerGroupIndex}
					onOpenChange={(open) => {
						if (!open) setViewerGroupIndex(null);
					}}
				/>
			) : null}
		</>
	);
}

export { StoriesTray };
