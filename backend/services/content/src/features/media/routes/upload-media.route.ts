import type { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/core/databases";
import { setFile } from "@/core/services/storage.service";
import { compressMediaFile } from "../services/media-compression.service";

export const registerMediaRoutes = (app: OpenAPIHono) => {
	app.post("/media/upload", async (c) => {
		try {
			const formData = await c.req.formData();
			const files = formData.getAll("files");
			const singleFile = formData.get("file");

			const allFiles: File[] = [];
			if (singleFile && singleFile instanceof File) {
				allFiles.push(singleFile);
			}
			if (files && files.length > 0) {
				for (const f of files) {
					if (f instanceof File && f.size > 0) {
						allFiles.push(f);
					}
				}
			}

			if (allFiles.length === 0) {
				return c.json({ error: "Aucun fichier valide fourni" }, 400);
			}

			const results = [];
			for (let i = 0; i < allFiles.slice(0, 4).length; i++) {
				const file = allFiles[i];
				const isVideo = file.type.startsWith("video/");
				const mediaType = isVideo ? "video" : "image";

				const lowQualityFile = isVideo
					? file
					: await compressMediaFile({ file, quality: 40 });
				const highQualityFile = isVideo
					? file
					: await compressMediaFile({ file, quality: 90 });

				const ext = isVideo ? file.name.split(".").pop() || "mp4" : "webp";
				const lowFilename = `upload_low_${Date.now()}_${i}.${ext}`;
				const highFilename = `upload_high_${Date.now()}_${i}.${ext}`;

				const lowPublicUrl = await setFile({
					file: lowQualityFile,
					filename: lowFilename,
				});
				const highPublicUrl = await setFile({
					file: highQualityFile,
					filename: highFilename,
				});

				const [lowDbFile, highDbFile] = await Promise.all([
					prisma.file.create({
						data: { filename: lowFilename, mimeType: lowQualityFile.type },
					}),
					prisma.file.create({
						data: { filename: highFilename, mimeType: highQualityFile.type },
					}),
				]);

				results.push({
					mediaType,
					lowQualityFileId: lowDbFile.id,
					highQualityFileId: highDbFile.id,
					lowQualityUrl: lowPublicUrl,
					highQualityUrl: highPublicUrl,
				});
			}

			return c.json({
				medias: results,
				mediaUrls: results.map((r) => r.lowQualityUrl),
			});
		} catch (error) {
			console.error("Media upload error:", error);
			return c.json(
				{ error: "Échec du traitement et de l'upload des médias" },
				500,
			);
		}
	});
};
