type HonoAuthenticatedEnv = {
	Variables: {
		authenticatedUser?: {
			id: string;
			sessionId: string;
		};
		authenticatedUserId?: string;
		authenticatedSessionId?: string;
	};
};

export type { HonoAuthenticatedEnv };
