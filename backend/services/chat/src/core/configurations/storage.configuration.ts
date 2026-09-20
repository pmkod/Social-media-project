import { getEnv } from "../functions/env.functions";

const StorageConfiguration = {
	s3: {
		accessKeyId: getEnv("S3_ACCESS_KEY_ID"),
		secretAccessKey: getEnv("S3_SECRET_ACCESS_KEY"),
		bucket: getEnv(
			"S3_DISCUSSION_BUCKET",
			"social-media-project-discussion",
		),
		endpoint: getEnv("S3_ENDPOINT"),
	},
};

export { StorageConfiguration };
