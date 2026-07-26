import jwt from "jsonwebtoken";
import { Configurations } from "../configurations";

type AccessTokenPayload = {
	sub: string;
	refreshTokenId?: string;
};

const verifyAccessToken = (token: string) => {
	return jwt.verify(
		token,
		Configurations.jwt.accessToken.secretKey,
	) as AccessTokenPayload;
};

export { verifyAccessToken };
export type { AccessTokenPayload };
