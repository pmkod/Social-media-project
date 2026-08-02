import { S3Client } from "bun";
import { Configurations } from "../configurations";

const s3Client = new S3Client({
	accessKeyId: Configurations.storage.s3.accessKeyId,
	secretAccessKey: Configurations.storage.s3.secretAccessKey,
	bucket: Configurations.storage.s3.bucket,
	endpoint: Configurations.storage.s3.endpoint,
});

type SetFileParams = {
	file: File | Blob | ArrayBuffer | Uint8Array;
	filename: string;
	bucket?: string;
};

const setFile = async ({
	file,
	filename,
	bucket,
}: SetFileParams): Promise<string> => {
	const targetBucket = bucket || Configurations.storage.s3.bucket;
	await s3Client.write(filename, file, { bucket: targetBucket });
	const publicUrl =
		Configurations.storage.s3.publicUrl ||
		`${Configurations.storage.s3.endpoint}/${targetBucket}`;
	return `${publicUrl}/${filename}`;
};

type GetFileParams = {
	fileName: string;
	bucket?: string;
};

const getFile = async ({ fileName, bucket }: GetFileParams) => {
	const targetBucket = bucket || Configurations.storage.s3.bucket;
	const file = s3Client.file(fileName, { bucket: targetBucket });
	return await file.arrayBuffer();
};

type DeleteFileParams = {
	fileName: string;
	bucket?: string;
};

const deleteFile = async ({ fileName, bucket }: DeleteFileParams) => {
	const targetBucket = bucket || Configurations.storage.s3.bucket;
	await s3Client.delete(fileName, { bucket: targetBucket });
};

export { setFile, getFile, deleteFile };
