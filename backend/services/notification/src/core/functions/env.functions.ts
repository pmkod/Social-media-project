import { HttpStatus } from "../constants/http-status";
import { Exception } from "../exceptions/exception";

const getEnv = (key: string, defaultValue?: string): string => {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Exception({
			message: `Environment variable ${key} is required`,
			status: HttpStatus.INTERNAL_SERVER_ERROR.code,
		});
	}
	return value;
};

export { getEnv };
