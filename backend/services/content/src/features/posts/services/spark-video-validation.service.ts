import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const SPARK_MAX_DURATION_SECONDS = 90;

/** Inspect the actual upload; browser metadata and MIME types are not sufficient. */
export async function validateSparkVideo(file: File): Promise<void> {
	const directory = await mkdtemp(join(tmpdir(), "chillspace-spark-"));
	try {
		const path = join(directory, "upload");
		await Bun.write(path, file);
		const process = Bun.spawn(
			[
				"ffprobe",
				"-v",
				"error",
				"-protocol_whitelist",
				"file,pipe",
				"-show_entries",
				"format=duration:stream=codec_type,duration",
				"-of",
				"json",
				path,
			],
			{ stdout: "pipe", stderr: "ignore" },
		);
		const timeout = setTimeout(() => process.kill(), 15_000);
		try {
			const output = await new Response(process.stdout).text();
			if ((await process.exited) !== 0)
				throw new Error("Unable to read this video. Try another file.");
			const metadata = JSON.parse(output) as {
				format?: { duration?: string };
				streams?: { codec_type?: string; duration?: string }[];
			};
			const videos =
				metadata.streams?.filter((stream) => stream.codec_type === "video") ??
				[];
			const duration = Math.max(
				Number(metadata.format?.duration ?? 0),
				...videos.map((stream) => Number(stream.duration ?? 0)),
			);
			if (videos.length === 0 || !Number.isFinite(duration) || duration <= 0) {
				throw new Error("Choose a video with a valid duration.");
			}
			if (duration > SPARK_MAX_DURATION_SECONDS) {
				throw new Error("Sparks must be 90 seconds or shorter.");
			}
		} finally {
			clearTimeout(timeout);
		}
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
}
