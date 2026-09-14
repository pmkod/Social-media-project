import { prisma } from "@/core/databases";
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
		throw new Exception({ message: "Verification process invalid or expired" });
	}

	if (!userVerification.verifiedAt) {
		throw new Exception({
			message: "User verification code has not been validated yet",
		});
	}

	return userVerification;
};

export { verifyIfUserVerificationCompleted };
