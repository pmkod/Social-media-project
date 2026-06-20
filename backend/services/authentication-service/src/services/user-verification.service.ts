import {
	MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS,
	USER_VERIFICATION_DURATION_IN_MINUTES,
} from "@/constants/authentication.constants";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";

type VerifyInput = {
	id: string;
	token: string;
	goal: string;
};

export async function verifyIfUserVerificationCompleted({ id, token, goal }: VerifyInput) {
	const verification = await prisma.userVerification.findFirst({
		where: { id },
	});

	if (!verification) {
		throw new AppError({
			message: "Verification not found",
			code: ErrorCodes.NOT_FOUND,
			statusCode: 404,
		});
	}

	if (
		verification.disabledAt !== null ||
		verification.verifiedAt !== null ||
		verification.goalAchievedAt !== null
	) {
		throw new AppError({
			message: "Verification is no longer valid",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	if (verification.goal !== goal) {
		throw new AppError({
			message: "Invalid verification goal",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	const expirationDate = new Date(
		verification.createdAt.getTime() + USER_VERIFICATION_DURATION_IN_MINUTES * 60 * 1000,
	);
	if (expirationDate < new Date()) {
		await prisma.userVerification.update({
			where: { id },
			data: { disabledAt: new Date() },
		});
		throw new AppError({
			message: "Verification code expired",
			code: ErrorCodes.VERIFICATION_EXPIRED,
			statusCode: 400,
		});
	}

	if (verification.token !== token) {
		await prisma.userVerification.update({
			where: { id },
			data: { disabledAt: new Date() },
		});
		throw new AppError({
			message: "Invalid verification token",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	if (verification.numberOfFailedAttempts >= MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS) {
		throw new AppError({
			message: "Too many failed attempts",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	return verification;
}

export async function markVerificationAsVerified(id: string) {
	await prisma.userVerification.update({
		where: { id },
		data: { verifiedAt: new Date() },
	});
}
