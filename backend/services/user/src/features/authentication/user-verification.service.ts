import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";

type VerifyParams = {
	id: string;
	token: string;
	goal: string;
};

const verifyIfUserVerificationCompleted = async ({ id, token, goal }: VerifyParams) => {
	const userVerification = await prisma.userVerification.findFirst({
		where: {
			id,
			token,
			goal,
			disabledAt: null,
		},
	});

	if (!userVerification) {
		throw new Exception({
			code: ExceptionCodes.verification_not_found_or_expired,
			message: "Verification process invalid or expired",
			status: HttpStatus.BAD_REQUEST.code,
		});
	}

	if (!userVerification.verifiedAt) {
		throw new Exception({
			code: ExceptionCodes.verification_not_completed,
			message: "User verification code has not been validated yet",
			status: HttpStatus.BAD_REQUEST.code,
		});
	}

	return userVerification;
};

export { verifyIfUserVerificationCompleted };
