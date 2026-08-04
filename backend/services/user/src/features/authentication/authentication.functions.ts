import {
	generateRandomDigits,
	generateRandomString,
} from "@/core/functions/random.functions";
import { USER_VERIFICATION_LIFETIME_IN_MINUTES } from "./authentication.constants";

const hashAlgorithm = "argon2id";

const generateUserVerificationCode = (): string => {
	return generateRandomDigits(6);
};

const hashUserVerificationCode = (code: string) => {
	return Bun.password.hash(code, { algorithm: hashAlgorithm });
};

type CompareUserVerificationCodeToHashParams = {
	code: string;
	hash: string;
};

const compareUserVerificationCodeToHash = ({
	code,
	hash,
}: CompareUserVerificationCodeToHashParams) => {
	return Bun.password.verify(code, hash, hashAlgorithm);
};

const hashPassword = (password: string) => {
	return Bun.password.hash(password, { algorithm: hashAlgorithm });
};

type ComparePasswordToHashParams = {
	password: string;
	hash: string;
};

const comparePasswordToHash = ({
	password,
	hash,
}: ComparePasswordToHashParams) => {
	return Bun.password.verify(password, hash, hashAlgorithm);
};

const generateUserVerificationToken = (): string => {
	return generateRandomString(32);
};

const generateRefreshTokenString = (): string => {
	return generateRandomString(64);
};

const hashRefreshToken = (token: string): string => {
	const hasher = new Bun.CryptoHasher("sha256");
	hasher.update(token);
	return hasher.digest("hex");
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
	generateRefreshTokenString,
	hashRefreshToken,
	hashUserVerificationCode,
	compareUserVerificationCodeToHash,
	hashPassword,
	comparePasswordToHash,
	isUserVerificationExpired,
};
