import { Link } from "@tanstack/react-router";
import { cn } from "@/core/lib/utils.ts";
import type { Discussion } from "../common/discussion.ts";
import {
	formatDiscussionDate,
	getDiscussionTitle,
	getMessagePreview,
} from "../common/discussion.utils.ts";
import { DiscussionAvatar } from "../common/discussion-avatar.tsx";

type DiscussionItemProps = {
	discussion: Discussion;
	authenticatedUserId?: string;
	isSelected?: boolean;
};

function DiscussionItem({
	discussion,
	authenticatedUserId,
	isSelected = false,
}: DiscussionItemProps) {
	const title = getDiscussionTitle(discussion, authenticatedUserId);

	return (
		<Link
			to="/discussions/$discussionId"
			params={{ discussionId: discussion.id }}
			aria-current={isSelected ? "page" : undefined}
			className={cn(
				"group flex w-full items-center gap-3 border-b border-border/70 px-4 py-3.5 text-left transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
				isSelected && "bg-primary/8 hover:bg-primary/10",
			)}
		>
			<DiscussionAvatar
				discussion={discussion}
				authenticatedUserId={authenticatedUserId}
				size="lg"
			/>

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span
						className={cn(
							"min-w-0 flex-1 truncate text-sm font-semibold text-foreground",
							discussion.unreadCount > 0 && "font-bold",
						)}
					>
						{title}
					</span>
					<span
						className={cn(
							"shrink-0 text-[11px] text-muted-foreground",
							discussion.unreadCount > 0 && "font-semibold text-primary",
						)}
					>
						{formatDiscussionDate(discussion.lastActivityAt)}
					</span>
				</div>

				<div className="mt-1 flex items-center gap-2">
					<p
						className={cn(
							"min-w-0 flex-1 truncate text-xs text-muted-foreground",
							discussion.unreadCount > 0 && "font-medium text-foreground/80",
						)}
					>
						{getMessagePreview(discussion, authenticatedUserId)}
					</p>
					{discussion.unreadCount > 0 ? (
						<span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-5 text-primary-foreground">
							{discussion.unreadCount > 99 ? "99+" : discussion.unreadCount}
						</span>
					) : null}
				</div>
			</div>
		</Link>
	);
}

export { DiscussionItem };
