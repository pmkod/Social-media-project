type RefreshTokenRequest = {
	refreshToken: string;
};

type RefreshTokenResponse = {
	accessToken: string;
};

export type { RefreshTokenRequest, RefreshTokenResponse };
