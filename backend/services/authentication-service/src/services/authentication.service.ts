import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "@/core/db";
import { refreshTokens, userVerifications, users } from "@/core/db/schema";
import { AppError, ErrorCodes } from "@/core/errors/app-error";
import { sendMail } from "@/core/services/mail.service";
import { UserVerificationGoals } from "@/constants/authentication.constants";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "@/functions/authentication.functions";
import { generateAccessToken } from "@/functions/jwt.functions";
import { comparePasswordToHash, hashPassword } from "@/functions/password.functions";
import {
	generateRefreshTokenString,
	hashRefreshToken,
} from "@/functions/refresh-token.functions";
import {
	markVerificationAsVerified,
	verifyIfUserVerificationCompleted,
} from "./user-verification.service";

async function createTokenPair(userId: string) {
	const rawRefreshToken = generateRefreshTokenString();
	const refreshTokenInDb = await db
		.insert(refreshTokens)
		.values({
			id: uuidv7(),
			userId,
			tokenHash: hashRefreshToken(rawRefreshToken),
			active: true,
		})
		.returning({ id: refreshTokens.id });

	const accessToken = generateAccessToken({
		userId,
		refreshTokenId: refreshTokenInDb[0].id,
	});

	return { accessToken, refreshToken: rawRefreshToken };
}

export async function createSignupVerification(input: {
	fullName: string;
	email: string;
	password: string;
}) {
	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, input.email),
	});

	if (existingUser?.active) {
		throw new AppError({
			message: "Email already taken",
			code: ErrorCodes.CONFLICT,
			statusCode: 409,
		});
	}

	const code = generateUserVerificationCode();
	const token = generateUserVerificationToken();
	const passwordHash = await hashPassword(input.password);

	const verification = await db
		.insert(userVerifications)
		.values({
			id: uuidv7(),
			email: input.email,
			fullName: input.fullName,
			passwordHash,
			code,
			token,
			goal: UserVerificationGoals.signup,
			numberOfCodeTransfersViaEmail: 1,
		})
		.returning({ id: userVerifications.id, token: userVerifications.token });

	await sendMail({
		receiver: input.email,
		subject: "Verify your account",
		content: `Your verification code is: ${code}`,
	});

	return verification[0];
}

export async function completeSignup(input: {
	verificationId: string;
	verificationToken: string;
	verificationCode: string;
	username: string;
}) {
	const verification = await verifyIfUserVerificationCompleted({
		id: input.verificationId,
		token: input.verificationToken,
		goal: UserVerificationGoals.signup,
	});

	if (verification.code !== input.verificationCode) {
		await db
			.update(userVerifications)
			.set({ numberOfFailedAttempts: verification.numberOfFailedAttempts + 1 })
			.where(eq(userVerifications.id, verification.id));

		throw new AppError({
			message: "Invalid verification code",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	if (!verification.fullName || !verification.passwordHash) {
		throw new AppError({
			message: "Signup data missing",
			code: ErrorCodes.INTERNAL_ERROR,
			statusCode: 500,
		});
	}

	const existingUsername = await db.query.users.findFirst({
		where: eq(users.username, input.username),
	});

	if (existingUsername) {
		throw new AppError({
			message: "Username already taken",
			code: ErrorCodes.CONFLICT,
			statusCode: 409,
		});
	}

	const user = await db
		.insert(users)
		.values({
			id: uuidv7(),
			email: verification.email,
			username: input.username,
			passwordHash: verification.passwordHash,
			fullName: verification.fullName,
			emailVerified: true,
			active: true,
		})
		.returning({ id: users.id });

	await markVerificationAsVerified(verification.id);
	await db
		.update(userVerifications)
		.set({ goalAchievedAt: new Date() })
		.where(eq(userVerifications.id, verification.id));

	return createTokenPair(user[0].id);
}

export async function createLoginVerification(input: { email: string; password: string }) {
	const user = await db.query.users.findFirst({
		where: eq(users.email, input.email),
	});

	if (!user || !user.active) {
		throw new AppError({
			message: "Invalid credentials",
			code: ErrorCodes.INVALID_CREDENTIALS,
			statusCode: 401,
		});
	}

	const isPasswordValid = await comparePasswordToHash({
		password: input.password,
		hash: user.passwordHash,
	});

	if (!isPasswordValid) {
		throw new AppError({
			message: "Invalid credentials",
			code: ErrorCodes.INVALID_CREDENTIALS,
			statusCode: 401,
		});
	}

	const code = generateUserVerificationCode();
	const token = generateUserVerificationToken();

	const verification = await db
		.insert(userVerifications)
		.values({
			id: uuidv7(),
			userId: user.id,
			email: input.email,
			code,
			token,
			goal: UserVerificationGoals.login,
			numberOfCodeTransfersViaEmail: 1,
		})
		.returning({ id: userVerifications.id, token: userVerifications.token });

	await sendMail({
		receiver: input.email,
		subject: "Verify your login",
		content: `Your verification code is: ${code}`,
	});

	return verification[0];
}

export async function completeLogin(input: {
	verificationId: string;
	verificationToken: string;
	verificationCode: string;
}) {
	const verification = await verifyIfUserVerificationCompleted({
		id: input.verificationId,
		token: input.verificationToken,
		goal: UserVerificationGoals.login,
	});

	if (!verification.userId) {
		throw new AppError({
			message: "Invalid verification",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	if (verification.code !== input.verificationCode) {
		await db
			.update(userVerifications)
			.set({ numberOfFailedAttempts: verification.numberOfFailedAttempts + 1 })
			.where(eq(userVerifications.id, verification.id));

		throw new AppError({
			message: "Invalid verification code",
			code: ErrorCodes.VERIFICATION_INVALID,
			statusCode: 400,
		});
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, verification.userId),
	});

	if (!user || !user.active) {
		throw new AppError({
			message: "User not found",
			code: ErrorCodes.NOT_FOUND,
			statusCode: 404,
		});
	}

	await markVerificationAsVerified(verification.id);
	await db
		.update(userVerifications)
		.set({ goalAchievedAt: new Date() })
		.where(eq(userVerifications.id, verification.id));

	return createTokenPair(user.id);
}

export async function createPasswordResetVerification(input: { email: string }) {
	const user = await db.query.users.findFirst({
		where: eq(users.email, input.email),
	});

	if (!user || !user.active) {
		throw new AppError({
			message: "Email not found",
			code: ErrorCodes.NOT_FOUND,
			statusCode: 404,
		});
	}

	const code = generateUserVerificationCode();
	const token = generateUserVerificationToken();

	const verification = await db
		.insert(userVerifications)
		.values({
			id: uuidv7(),
			userId: user.id,
			email: input.email,
			code,
			token,
			goal: UserVerificationGoals.passwordReset,
			numberOfCodeTransfersViaEmail: 1,
		})
		.returning({ id: userVerifications.id, token: userVerifications.token });

	await sendMail({
		receiver: input.email,
		subject: "Reset your password",
		content: `Your password reset code is: ${code}`,
	});

	return verification[0];
}
