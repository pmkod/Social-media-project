import { S3Client } from "bun";
import { Configurations } from "../configurations";

const s3Client = new S3Client({
	accessKeyId: Configurations.storage.s3.accessKeyId,
	secretAccessKey: Configurations.storage.s3.secretAccessKey,
	bucket: Configurations.storage.s3.bucket,
	endpoint: Configurations.storage.s3.endpoint,
});

const setDiscussionFile = async ({
	file,
	fileName,
}: {
	file: File | Blob | ArrayBuffer | Uint8Array;
	fileName: string;
}) => {
	await s3Client.write(fileName, file, {
		bucket: Configurations.storage.s3.bucket,
	});
};

const getDiscussionFile = (fileName: string) =>
	s3Client.file(fileName, { bucket: Configurations.storage.s3.bucket });

const deleteDiscussionFile = async (fileName: string) => {
	await s3Client.delete(fileName, {
		bucket: Configurations.storage.s3.bucket,
	});
};

export { deleteDiscussionFile, getDiscussionFile, setDiscussionFile };
