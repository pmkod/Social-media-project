type HonoAuthenticatedEnv = {
	Variables: {
		authenticatedUser: {
			id: string;
			sessionId: string;
		};
	};
};

export type { HonoAuthenticatedEnv };
