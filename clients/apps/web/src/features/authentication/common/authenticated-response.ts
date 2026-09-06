type AuthenticatedResponse = {
	session: {
		id: string;
		token: string;
	};
};

export type { AuthenticatedResponse };
