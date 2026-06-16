import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { userVerifications } from "@/core/db/schema";
import { AppError, ErrorCodes } from "@/core/errors/app-error";
import {
	MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS,
	USER_VERIFICATION_DURATION_IN_MINUTES,
} from "@/constants/authentication.constants";

type VerifyInput = {
	id: string;
	token: string;
	goal: string;
};

export async function verifyIfUserVerificationCompleted({ id, token, goal }: VerifyInput) {
	const verification = await db.query.userVerifications.findFirst({
		where: eq(userVerifications.id, id),
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
		await db
			.update(userVerifications)
			.set({ disabledAt: new Date() })
			.where(eq(userVerifications.id, id));
		throw new AppError({
			message: "Verification code expired",
			code: ErrorCodes.VERIFICATION_EXPIRED,
			statusCode: 400,
		});
	}

	if (verification.token !== token) {
		await db
			.update(userVerifications)
			.set({ disabledAt: new Date() })
			.where(eq(userVerifications.id, id));
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
	await db
		.update(userVerifications)
		.set({ verifiedAt: new Date() })
		.where(eq(userVerifications.id, id));
}

export async function verifyUserVerificationCode({ id, token }: { id: string; token: string }) {
	const verification = await db.query.userVerifications.findFirst({
		where: eq(userVerifications.id, id),
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

	const expirationDate = new Date(
		verification.createdAt.getTime() + USER_VERIFICATION_DURATION_IN_MINUTES * 60 * 1000,
	);
	if (expirationDate < new Date()) {
		await db
			.update(userVerifications)
			.set({ disabledAt: new Date() })
			.where(eq(userVerifications.id, id));
		throw new AppError({
			message: "Verification code expired",
			code: ErrorCodes.VERIFICATION_EXPIRED,
			statusCode: 400,
		});
	}

	if (verification.token !== token) {
		await db
			.update(userVerifications)
			.set({ disabledAt: new Date() })
			.where(eq(userVerifications.id, id));
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
