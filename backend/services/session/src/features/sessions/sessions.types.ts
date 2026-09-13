type Session = {
	id: string;
	active: boolean;
	logoutAt: string | null;
	userId: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
};

export type { Session };
