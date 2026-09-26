import ky from "ky";

const internalHttpClient = ky.create({
	retry: { limit: 1 },
});

export { internalHttpClient };
