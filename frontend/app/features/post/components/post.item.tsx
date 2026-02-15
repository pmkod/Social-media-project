import { EllipsisVertical, Heart, MessageCircle } from "lucide-react";

import { Avatar } from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card";
import { formatDistance, formatNumberToCompact } from "@/core/lib/utils";
import type { Post } from "@/features/post/types/post";

export function PostItem({ post }: { post: Post }) {
	return (
		<Card className="pb-2 rounded-md border border-gray-300 shadow-none">
			<article>
				<CardHeader className="flex-row flex mb-3 justify-between items-center gap-x-3 space-y-0">
					<div className="flex items-center gap-x-2">
						<Avatar />
						<div>
							<CardTitle>{post.author.fullName}</CardTitle>
							<CardDescription className="inline-flex items-baseline">
								<p className="">@{post.author.username}</p>
								<span className="mx-2">-</span>
								<span className="text-xs">
									{formatDistance(post.createdAt)}
								</span>
							</CardDescription>
						</div>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0"
					>
						<EllipsisVertical className="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					{post.content && <p>{post.content}</p>}
					{/* {data.media && <MediaGrid className="mt-2" data={data.media} />} */}
				</CardContent>
				<div className="px-6 pb-3 pt-5">
					<div className="w-full flex gap-x-1">
						<button
							type="button"
							className="flex items-center rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors text-gray-700"
						>
							<Heart className="size-6" />
							{post.likeCount > 0 ? (
								<span className="text-lg ml-2.5">
									{formatNumberToCompact(post.likeCount)}
								</span>
							) : null}
						</button>

						<button
							type="button"
							className="flex items-center rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors text-gray-700"
						>
							<MessageCircle className="size-5" />
							{post.commentCount > 0 ? (
								<span className="text-lg ml-2.5">
									{formatNumberToCompact(post.commentCount)}
								</span>
							) : null}
						</button>
					</div>
					{/* <Separator orientation="horizontal" /> */}
					{/* <div className="grid grid-cols-4 gap-x-1.5">
						<Toggle
							type="button"
							size="lg"
							className="flex-col items-center hover:text-accent-foreground md:flex-row"
							defaultPressed={data.isLiked}
						>
							<ThumbsUp className="h-4 w-4 shrink-0 md:me-2" />
							<span>Like</span>
						</Toggle>
						<Button
							type="button"
							variant="ghost"
							size="lg"
							className="flex-col md:flex-row"
						>
							<Repeat className="h-4 w-4 shrink-0 md:me-2" />
							<span>Repost</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="lg"
							className="flex-col md:flex-row"
						>
							<Forward className="h-4 w-4 shrink-0 md:me-2" />
							<span>Share</span>
						</Button>
					</div> */}
				</div>
			</article>
		</Card>
	);
}
