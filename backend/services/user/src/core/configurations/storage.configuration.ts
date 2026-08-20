import { getEnv } from "../functions/env.functions";

const StorageConfiguration = {
	s3: {
		accessKeyId: getEnv("S3_ACCESS_KEY_ID", "minioadmin"),
		secretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", "minioadmin"),
		bucket: getEnv("S3_BUCKET", "social-media-project"),
		endpoint: getEnv("S3_ENDPOINT", "http://localhost:9000"),
		publicUrl: getEnv(
			"S3_PUBLIC_URL",
			"http://localhost:9000/social-media-project",
		),
	},
};

export { StorageConfiguration };
