import sharp from "sharp";
import { PostMediaCompressionFormat } from "../posts.constants";

type CompressPostMediaFileParams = {
	file: File;
	quality: number; // 0 to 100
};

const compressPostMediaFile = async (
	params: CompressPostMediaFileParams,
): Promise<File> => {
	const { file, quality } = params;

	if (!file.type.startsWith("image/")) {
		return file;
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const result = await sharp(arrayBuffer)
			.toFormat(PostMediaCompressionFormat.ext, { quality })
			.toBuffer();

		return new File([result], "", {
			type: PostMediaCompressionFormat.mime,
		});
	} catch (error) {
		console.warn("Image compression fallback to original file:", error);
		return file;
	}
};

export { compressPostMediaFile };
