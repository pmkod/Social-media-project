import { prisma } from "@/core/databases";

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
		throw new Error("Verification process invalid or expired");
	}

	if (!userVerification.verifiedAt) {
		throw new Error("User verification code has not been validated yet");
	}

	return userVerification;
};

export { verifyIfUserVerificationCompleted };
