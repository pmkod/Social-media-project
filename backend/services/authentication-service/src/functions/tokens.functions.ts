import { uuidv7 } from "uuidv7";
import { prisma } from "@/database";
import { generateAccessToken } from "@/functions/jwt.functions";
import { generateRefreshTokenString, hashRefreshToken } from "@/functions/refresh-token.functions";

export async function createTokenPair(userId: string) {
	const rawRefreshToken = generateRefreshTokenString();
	const refreshTokenInDb = await prisma.refreshToken.create({
		data: {
			id: uuidv7(),
			userId,
			tokenHash: hashRefreshToken(rawRefreshToken),
			active: true,
		},
		select: { id: true },
	});

	const accessToken = generateAccessToken({
		userId,
		refreshTokenId: refreshTokenInDb.id,
	});

	return { accessToken, refreshToken: rawRefreshToken };
}
