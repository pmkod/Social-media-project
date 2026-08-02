import { getEnv } from "../functions/env.functions";

const StorageConfiguration = {
	s3: {
		accessKeyId: getEnv("S3_ACCESS_KEY_ID"),
		secretAccessKey: getEnv("S3_SECRET_ACCESS_KEY"),
		bucket: getEnv("S3_BUCKET"),
		endpoint: getEnv("S3_ENDPOINT"),
		publicUrl: getEnv("S3_PUBLIC_URL"),
	},
};

export { StorageConfiguration };
