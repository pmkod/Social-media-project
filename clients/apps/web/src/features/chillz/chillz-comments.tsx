import { RiCloseLine } from "@remixicon/react";
import { useRef } from "react";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/core/components/ui/sheet.tsx";
import { PostComments } from "@/features/comment/post-comments.tsx";
import type { Post } from "@/features/post/common/post.ts";

export function ChillzComments({
	post,
	open,
	onOpenChange,
	isDesktop,
}: {
	post: Post;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isDesktop: boolean;
}) {
	const contentRef = useRef<HTMLDivElement>(null);
	const title = (
		<>
			Comments{" "}
			<span className="text-muted-foreground">{post.commentsCount ?? 0}</span>
		</>
	);
	if (isDesktop) {
		return open ? (
			<aside
				id="chillz-comments"
				aria-label="Chillz comments"
				className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-2xl border bg-background xl:w-96"
			>
				<header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
					<h2 className="flex items-center gap-2 text-lg font-semibold">
						{title}
					</h2>
					<IconButton
						variant="ghost"
						aria-label="Close comments"
						onClick={() => onOpenChange(false)}
					>
						<RiCloseLine />
					</IconButton>
				</header>
				<PostComments key={post.id} postId={post.id} layout="panel" />
			</aside>
		) : null;
	}
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				ref={contentRef}
				id="chillz-comments"
				side="bottom"
				className="h-[75dvh] max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
			>
				<SheetHeader className="shrink-0 border-b pr-12">
					<SheetTitle className="flex items-center gap-2 text-lg">
						{title}
					</SheetTitle>
					<SheetDescription className="sr-only">
						Comments on this Chillz.
					</SheetDescription>
				</SheetHeader>
				<PostComments key={post.id} postId={post.id} layout="panel" />
			</SheetContent>
		</Sheet>
	);
}
