import sharp from "sharp";
import { Configurations } from "@/core/configurations";
import { prisma } from "@/core/databases";
import { getFile, setFile } from "@/core/services/storage.service";
import {
	CommentMediaCompressionFormat,
	CommentMediaTypes,
} from "../comments.constants";

type CompressCommentMediaFileParams = {
	file: File;
	quality: number; // 0 to 100
};

const compressCommentMediaFile = async (
	params: CompressCommentMediaFileParams,
): Promise<File> => {
	const { file, quality } = params;

	if (!file.type.startsWith("image/")) {
		return file;
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const result = await sharp(arrayBuffer)
			.toFormat(CommentMediaCompressionFormat.ext, { quality })
			.toBuffer();

		return new File([result], "", {
			type: CommentMediaCompressionFormat.mime,
		});
	} catch (error) {
		console.warn("Image compression fallback to original file:", error);
		return file;
	}
};

const getCommentMediaFile = async ({ fileName }: { fileName: string }) => {
	return getFile({
		bucket: Configurations.storage.s3.bucket,
		fileName,
	});
};

type CreateCommentMediasParams = {
	commentId: string;
	medias: File[];
	startingPosition?: number;
};

const createCommentMedias = async ({
	commentId,
	medias,
	startingPosition = 1,
}: CreateCommentMediasParams) => {
	const createdMedias = [];

	for (let i = 0; i < medias.length; i++) {
		const media = medias[i];
		if (!(media instanceof File)) continue;
		const position = startingPosition + i;

		const isVideo = media.type.startsWith("video/");
		const mediaType = isVideo
			? CommentMediaTypes.VIDEO
			: CommentMediaTypes.IMAGE;

		const lowQualityFile = isVideo
			? media
			: await compressCommentMediaFile({
					file: media,
					quality: 50,
				});
		const highQualityFile = media;

		const lowQualityFileExt = isVideo
			? media.name.split(".").pop() || "mp4"
			: CommentMediaCompressionFormat.ext;
		const highQualityFileExt = highQualityFile.name.split(".").pop() || "webp";

		const lowQualityMediaFileName = `comment_${commentId}_low_${Date.now()}_${i}.${lowQualityFileExt}`;
		const highQualityMediaFileName = `comment_${commentId}_high_${Date.now()}_${i}.${highQualityFileExt}`;

		await setFile({
			file: lowQualityFile,
			filename: lowQualityMediaFileName,
			bucket: Configurations.storage.s3.bucket,
		});
		await setFile({
			file: highQualityFile,
			filename: highQualityMediaFileName,
			bucket: Configurations.storage.s3.bucket,
		});

		const commentMedia = await prisma.commentMedia.create({
			data: {
				comment: {
					connect: {
						id: commentId,
					},
				},
				position,
				mediaType,
				lowQualityFile: {
					create: {
						filename: lowQualityMediaFileName,
						mimeType: lowQualityFile.type,
					},
				},
				highQualityFile: {
					create: {
						filename: highQualityMediaFileName,
						mimeType: highQualityFile.type,
					},
				},
			},
			select: {
				id: true,
				position: true,
				mediaType: true,
			},
		});

		createdMedias.push(commentMedia);
	}

	return createdMedias;
};

export { createCommentMedias, getCommentMediaFile };
