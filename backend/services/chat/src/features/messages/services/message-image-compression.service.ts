import sharp from "sharp";
import { MessageImageCompressionFormat } from "../messages.constants";

const compressMessageImage = async (
	file: File,
	quality: number,
): Promise<File> => {
	try {
		const source = await file.arrayBuffer();
		const compressed = await sharp(source)
			.toFormat(MessageImageCompressionFormat.extension, { quality })
			.toBuffer();

		return new File([compressed], "", {
			type: MessageImageCompressionFormat.mimeType,
		});
	} catch (error) {
		console.warn("Message image compression fallback to original file:", error);
		return file;
	}
};

export { compressMessageImage };
