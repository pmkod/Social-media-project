import jwt from "jsonwebtoken";
import { Configurations } from "@/core/configurations";

type AccessTokenPayload = {
	refreshTokenId?: string;
	userId: string;
};

type GenerateAccessTokenParams = AccessTokenPayload;

const generateAccessToken = ({
	refreshTokenId,
	userId,
}: GenerateAccessTokenParams) => {
	return jwt.sign(
		{ sub: userId, refreshTokenId },
		Configurations.jwt.accessToken.secretKey,
		{
			expiresIn: Configurations.jwt.accessToken.durationInSec,
		},
	);
};

export { generateAccessToken };
