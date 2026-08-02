import type { OpenAPIHono } from "@hono/zod-openapi";
import { setFile } from "@/core/services/storage.service";

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

			const mediaUrls: string[] = [];
			for (const file of allFiles.slice(0, 4)) {
				const ext = file.name.split(".").pop() || "bin";
				const filename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
				const publicUrl = await setFile({ file, filename });
				mediaUrls.push(publicUrl);
			}

			return c.json({ mediaUrls, urls: mediaUrls });
		} catch (error) {
			console.error("Media upload error:", error);
			return c.json({ error: "Échec de l'envoi des médias vers S3" }, 500);
		}
	});
};
