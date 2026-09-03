import { Configurations } from "@/core/configurations";
import { deleteFile, setFile } from "@/core/services/storage.service";

const setStoryMediaFile = async ({
	file,
	filename,
}: {
	file: File;
	filename: string;
}) => {
	await setFile({
		file,
		filename,
		bucket: Configurations.storage.s3.bucket,
	});
};

const deleteStoryMediaFile = async (filename: string) => {
	await deleteFile({
		fileName: filename,
		bucket: Configurations.storage.s3.bucket,
	});
};

export { deleteStoryMediaFile, setStoryMediaFile };
