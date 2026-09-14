import { Exception } from "../exceptions/exception";

const getEnv = (key: string, defaultValue?: string): string => {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Exception({ message: `Environment variable ${key} is required` });
	}
	return value;
};

export { getEnv };
