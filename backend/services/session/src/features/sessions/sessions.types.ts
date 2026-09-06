type Session = {
	id: string;
	active: boolean;
	logoutAt: string | null;
	userId: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
};

type StoredSession = Session & {
	tokenHash: string;
};

type CreateSessionInput = Pick<Session, "userId" | "ipAddress" | "userAgent">;

export type { CreateSessionInput, Session, StoredSession };
