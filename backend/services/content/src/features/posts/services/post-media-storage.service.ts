import { Configurations } from "@/core/configurations";
import { getFile, setFile } from "@/core/services/storage.service";

type GetPostMediaFileParams = {
	fileName: string;
};

const getPostMediaFile = async ({ fileName }: GetPostMediaFileParams) => {
	return getFile({
		bucket: Configurations.storage.s3.bucket,
		fileName,
	});
};

const setPostMediaFile = async ({
	file,
	filename,
}: {
	file: File;
	filename: string;
}) => {
	await setFile({ file, filename, bucket: Configurations.storage.s3.bucket });
};

export { setPostMediaFile, getPostMediaFile };
