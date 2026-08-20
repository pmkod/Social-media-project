import sharp from "sharp";

type CompressProfileMediaFileParams = {
	file: File;
	quality: number;
};

const compressProfileMediaFile = async ({
	file,
	quality,
}: CompressProfileMediaFileParams): Promise<File> => {
	if (!file.type.startsWith("image/")) {
		return file;
	}

	try {
		const result = await sharp(await file.arrayBuffer())
			.toFormat("webp", { quality })
			.toBuffer();

		return new File([result], "", { type: "image/webp" });
	} catch (error) {
		console.warn("Profile image compression fallback to original file:", error);
		return file;
	}
};

export { compressProfileMediaFile };
