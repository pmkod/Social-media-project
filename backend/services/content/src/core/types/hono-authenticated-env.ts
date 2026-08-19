type HonoAuthenticatedEnv = {
	Variables: {
		authenticatedUser?: {
			id: string;
		};
		authenticatedUserId?: string;
	};
};

export type { HonoAuthenticatedEnv };
