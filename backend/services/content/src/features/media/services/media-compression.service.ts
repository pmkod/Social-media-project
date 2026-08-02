import sharp from "sharp";

type CompressMediaFileParams = {
	file: File;
	quality: number; // 0 to 100
};

export const compressMediaFile = async (
	params: CompressMediaFileParams,
): Promise<File> => {
	const { file, quality } = params;

	if (!file.type.startsWith("image/")) {
		return file;
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const result = await sharp(arrayBuffer)
			.toFormat("webp", { quality })
			.toBuffer();

		return new File([result], file.name.replace(/\.[^/.]+$/, ".webp"), {
			type: "image/webp",
		});
	} catch (error) {
		console.warn(
			"Failed to compress image with sharp, using original file:",
			error,
		);
		return file;
	}
};
