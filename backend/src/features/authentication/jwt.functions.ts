import jwt from "jsonwebtoken";

//
//
//
//
//
//
//
//
//
//

const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || "";
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY || "";

const ACCESS_TOKEN_DURATION = 60 * 5;
const REFRESH_TOKEN_DURATION = 60 * 60 * 24 * 90;

type AccessTokenPayload = {
	refreshTokenId: string;
	userId: string;
};

type GenerateAccessTokenParams = AccessTokenPayload;

const generateAccessToken = ({
	refreshTokenId,
	userId,
}: GenerateAccessTokenParams) => {
	return jwt.sign({ userId, refreshTokenId }, ACCESS_TOKEN_SECRET_KEY, {
		expiresIn: ACCESS_TOKEN_DURATION,
	});
};

const verifyAccessToken = (token: string) => {
	return jwt.verify(token, ACCESS_TOKEN_SECRET_KEY) as AccessTokenPayload;
};

//
//
//
//
//
//
//
//
//
//

type RefreshTokenPayload = {
	refreshTokenId: string;
};

type GenerateRefreshTokenParams = RefreshTokenPayload;

const generateRefreshToken = ({
	refreshTokenId,
}: GenerateRefreshTokenParams) => {
	return jwt.sign({ refreshTokenId }, REFRESH_TOKEN_SECRET_KEY, {
		expiresIn: REFRESH_TOKEN_DURATION,
	});
};

const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, REFRESH_TOKEN_SECRET_KEY) as RefreshTokenPayload;
};

//
//
//
//
//
//
//
//
//
//
//

type GenerateAccessAndRefreshTokenParams = {
	refreshTokenId: string;
	userId: string;
};

const generateAccessAndRefreshToken = ({
	refreshTokenId,
	userId,
}: GenerateAccessAndRefreshTokenParams) => {
	const accessToken = generateAccessToken({
		refreshTokenId,
		userId,
	});
	const refreshToken = generateRefreshToken({ refreshTokenId });
	return { accessToken, refreshToken };
};

//
//
//
//
//
//
//
//
//
//
//

export {
	generateAccessAndRefreshToken,
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
};
