import { generateRandomDigits, generateRandomString } from "@/core/functions/random.functions";

const generateUserVerificationCode = (): string => {
	return generateRandomDigits(6);
};

const generateUserVerificationToken = (): string => {
	return generateRandomString(32);
};

export { generateUserVerificationCode, generateUserVerificationToken };
