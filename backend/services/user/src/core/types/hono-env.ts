type HonoEnv = {
	Variables: {
		authenticatedUser?: {
			id: string;
			sessionId: string;
		};
	};
};

export type { HonoEnv };
