import {
	RiArrowLeftLine,
	RiFlag2Line,
	RiInformationLine,
	RiMoreLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { ReportModal } from "@/features/report/report.modal.tsx";
import type { Discussion } from "../common/discussion.ts";
import {
	getDiscussionSubtitle,
	getDiscussionTitle,
} from "../common/discussion.utils.ts";
import { DiscussionAvatar } from "../common/discussion-avatar.tsx";
import { DiscussionInfoModal } from "../info/discussion-info.modal.tsx";

type DiscussionHeaderProps = {
	discussion: Discussion;
	authenticatedUserId?: string;
};

function DiscussionHeader({
	discussion,
	authenticatedUserId,
}: DiscussionHeaderProps) {
	return (
		<header className="z-10 flex h-18 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-md sm:px-4">
			<Link
				to="/discussions"
				aria-label="Back to conversations"
				className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
			>
				<RiArrowLeftLine className="size-5" />
			</Link>

			<DiscussionAvatar
				discussion={discussion}
				authenticatedUserId={authenticatedUserId}
				size="md"
			/>
			<div className="min-w-0 flex-1">
				<h1 className="truncate text-sm font-bold sm:text-base">
					{getDiscussionTitle(discussion, authenticatedUserId)}
				</h1>
				<p className="truncate text-xs text-muted-foreground">
					{getDiscussionSubtitle(discussion, authenticatedUserId)}
				</p>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<IconButton
						type="button"
						variant="ghost"
						size="lg"
						aria-label="Options de la discussion"
					>
						<RiMoreLine />
					</IconButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-64">
					<DropdownMenuItem
						disabled={!authenticatedUserId}
						onSelect={() => {
							if (!authenticatedUserId) return;
							void NiceModal.show(DiscussionInfoModal, {
								discussion,
								authenticatedUserId,
							});
						}}
					>
						<RiInformationLine />
						Informations sur la discussion
					</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => {
							void NiceModal.show(ReportModal, {
								discussionId: discussion.id,
							});
						}}
					>
						<RiFlag2Line />
						Signaler
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}

export { DiscussionHeader };
