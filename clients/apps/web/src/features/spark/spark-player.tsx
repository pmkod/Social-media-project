import { useEffect, useRef, useState } from "react";

export function SparkPlayer({
	src,
	paused = false,
}: {
	src: string;
	paused?: boolean;
}) {
	const ref = useRef<HTMLVideoElement>(null);
	const [visible, setVisible] = useState(false);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		const video = ref.current;
		if (!video) return;
		const observer = new IntersectionObserver(
			([entry]) =>
				setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.65),
			{ threshold: [0, 0.65] },
		);
		observer.observe(video);
		return () => {
			observer.disconnect();
			video.pause();
		};
	}, []);
	useEffect(() => {
		const video = ref.current;
		if (!video) return;
		const sync = () => {
			if (visible && !paused && !document.hidden)
				void video.play().catch(() => {});
			else video.pause();
		};
		sync();
		document.addEventListener("visibilitychange", sync);
		return () => {
			document.removeEventListener("visibilitychange", sync);
			video.pause();
		};
	}, [visible, paused]);
	return (
		<div className="relative flex aspect-[9/16] max-h-[calc(100dvh-18rem)] min-h-64 w-full items-center justify-center bg-black">
			<video
				ref={ref}
				src={src}
				muted
				loop
				playsInline
				controls
				preload="metadata"
				aria-label="Spark video"
				onError={() => setFailed(true)}
				className="h-full w-full object-contain"
			/>
			{failed ? (
				<div
					role="alert"
					className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center text-sm text-white"
				>
					<p>This video could not be loaded.</p>
					<button
						type="button"
						className="rounded-full border border-white/40 px-4 py-2"
						onClick={() => {
							setFailed(false);
							ref.current?.load();
						}}
					>
						Try again
					</button>
				</div>
			) : null}
		</div>
	);
}
