import {
	RiCloseLine,
	RiImageAddLine,
	RiPlayCircleLine,
} from "@remixicon/react";
import { isHTTPError } from "ky";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { useSelectFiles } from "@/core/hooks/use-select-files.ts";
import { cn } from "@/core/lib/utils.ts";
import { useCreateStory } from "../use-create-story.ts";

const STORY_MEDIA_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"video/mp4",
	"video/webm",
	"video/ogg",
];
const STORY_MAX_FILE_SIZE = 20_000_000;

type CreateStoryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
	const { selectFiles } = useSelectFiles();
	const { mutate, isPending } = useCreateStory();
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setFile(null);
			setError(null);
		}
	}, [open]);

	const previewUrl = useMemo(
		() => (file ? URL.createObjectURL(file) : null),
		[file],
	);
	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const chooseFile = async () => {
		setError(null);
		const [selectedFile] = await selectFiles({
			accept: STORY_MEDIA_MIME_TYPES.join(","),
			multiple: false,
		});
		if (!selectedFile) return;
		if (
			!STORY_MEDIA_MIME_TYPES.includes(selectedFile.type) ||
			selectedFile.size === 0 ||
			selectedFile.size > STORY_MAX_FILE_SIZE
		) {
			setError("Choose a supported image or video up to 20 MB.");
			return;
		}
		setFile(selectedFile);
	};

	const publish = () => {
		if (!file || isPending) return;
		setError(null);
		mutate(
			{ media: file },
			{
				onSuccess: () => onOpenChange(false),
				onError: (mutationError) =>
					setError(
						isHTTPError(mutationError) &&
							typeof mutationError.data === "object" &&
							mutationError.data !== null &&
							"message" in mutationError.data &&
							typeof mutationError.data.message === "string"
							? mutationError.data.message
							: "Unable to publish this story. Please try again.",
					),
			},
		);
	};

	const isVideo = file?.type.startsWith("video/") ?? false;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md" className="h-[min(42rem,calc(100dvh-2rem))]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 pr-8">
						<RiImageAddLine className="size-5 text-primary" />
						Share a story
					</DialogTitle>
					<DialogDescription>
						Choose one image or video. It will disappear after 24 hours.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-4 px-5 py-5">
					{file && previewUrl ? (
						<div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-zinc-950">
							{isVideo ? (
								<video
									src={previewUrl}
									controls
									muted
									playsInline
									className="max-h-full max-w-full object-contain"
								/>
							) : (
								<img
									src={previewUrl}
									alt="Story preview"
									className="max-h-full max-w-full object-contain"
								/>
							)}
							<button
								type="button"
								onClick={() => setFile(null)}
								className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
								aria-label="Remove selected media"
							>
								<RiCloseLine className="size-5" />
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => void chooseFile()}
							className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 text-center transition-colors hover:border-primary hover:bg-accent"
						>
							<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
								<RiImageAddLine className="size-7" />
							</div>
							<span className="font-semibold">Choose media</span>
							<span className="text-sm text-muted-foreground">
								JPG, PNG, WebP, MP4, WebM or Ogg · 20 MB max
							</span>
						</button>
					)}
					{file ? (
						<div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2 text-sm">
							<div className="flex min-w-0 items-center gap-2">
								{isVideo ? (
									<RiPlayCircleLine className="size-4 shrink-0 text-primary" />
								) : (
									<RiImageAddLine className="size-4 shrink-0 text-primary" />
								)}
								<span className="truncate">{file.name}</span>
							</div>
							<span className="shrink-0 text-xs text-muted-foreground">
								{(file.size / 1_000_000).toFixed(1)} MB
							</span>
						</div>
					) : null}
					{error ? (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					) : null}
				</DialogBody>
				<DialogFooter>
					<Button
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={publish}
						disabled={!file || isPending}
						className={cn(isPending && "cursor-wait")}
					>
						{isPending ? "Publishing…" : "Share story"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { CreateStoryDialog };
