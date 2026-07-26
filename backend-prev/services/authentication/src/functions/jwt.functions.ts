import jwt from "jsonwebtoken";
import { environment } from "@/config/environment.configuration";

export type AccessTokenPayload = {
	userId: string;
	refreshTokenId: string;
};

export function generateAccessToken(payload: AccessTokenPayload): string {
	return jwt.sign({ ...payload, iss: "social-media-app" }, environment.JWT_SECRET, {
		expiresIn: environment.JWT_ACCESS_EXPIRATION as jwt.SignOptions["expiresIn"],
	});
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(token, environment.JWT_SECRET) as AccessTokenPayload;
}
