type HonoAuthenticatedEnv = {
	Variables: {
		authenticatedUser?: {
			id: string;
			refreshTokenId?: string;
		};
	};
};

export type { HonoAuthenticatedEnv };
