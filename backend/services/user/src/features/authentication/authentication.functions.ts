import {
	generateRandomDigits,
	generateRandomString,
} from "@/core/functions/random.functions";
import { USER_VERIFICATION_LIFETIME_IN_MINUTES } from "./authentication.constants";

const generateUserVerificationCode = (): string => {
	return generateRandomDigits(6);
};

const generateUserVerificationToken = (): string => {
	return generateRandomString(32);
};

const isUserVerificationExpired = (userVerification: {
	createdAt: Date;
}): boolean => {
	const expirationTime = new Date(
		userVerification.createdAt.getTime() +
			USER_VERIFICATION_LIFETIME_IN_MINUTES * 60 * 1000,
	);
	return expirationTime < new Date();
};

export {
	generateUserVerificationCode,
	generateUserVerificationToken,
	isUserVerificationExpired,
};
