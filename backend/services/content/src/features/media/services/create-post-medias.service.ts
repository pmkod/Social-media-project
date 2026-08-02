import { prisma } from "@/core/databases";
import { setFile } from "@/core/services/storage.service";
import { compressMediaFile } from "./media-compression.service";

type CreatePostMediasParams = {
	postId: string;
	medias: File[];
	startingPosition?: number;
};

export const createPostMedias = async ({
	postId,
	medias,
	startingPosition = 1,
}: CreatePostMediasParams) => {
	const createdMedias = [];

	for (let i = 0; i < medias.length; i++) {
		const media = medias[i];
		if (!(media instanceof File)) continue;

		const position = startingPosition + i;
		const isVideo = media.type.startsWith("video/");
		const mediaType = isVideo ? "video" : "image";

		const lowQualityFile = isVideo
			? media
			: await compressMediaFile({ file: media, quality: 40 });

		const highQualityFile = isVideo
			? media
			: await compressMediaFile({ file: media, quality: 90 });

		const lowExt = isVideo ? media.name.split(".").pop() || "mp4" : "webp";
		const highExt = isVideo ? media.name.split(".").pop() || "mp4" : "webp";

		const lowFilename = `post_${postId}_low_${Date.now()}_${i}.${lowExt}`;
		const highFilename = `post_${postId}_high_${Date.now()}_${i}.${highExt}`;

		const lowPublicUrl = await setFile({
			file: lowQualityFile,
			filename: lowFilename,
		});
		const highPublicUrl = await setFile({
			file: highQualityFile,
			filename: highFilename,
		});

		const postMedia = await prisma.postMedia.create({
			data: {
				post: {
					connect: { id: postId },
				},
				position,
				mediaType,
				lowQualityFile: {
					create: {
						filename: lowFilename,
						mimeType: lowQualityFile.type,
					},
				},
				highQualityFile: {
					create: {
						filename: highFilename,
						mimeType: highQualityFile.type,
					},
				},
			},
			include: {
				lowQualityFile: true,
				highQualityFile: true,
			},
		});

		createdMedias.push({
			id: postMedia.id,
			mediaType: postMedia.mediaType,
			position: postMedia.position,
			lowQualityUrl: lowPublicUrl,
			highQualityUrl: highPublicUrl,
		});
	}

	return createdMedias;
};
