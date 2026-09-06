import { Configurations } from "@/core/configurations";
import { getRedis } from "@/core/databases";
import {
	generateSessionToken,
	hashSessionToken,
	sessionTokenMatchesHash,
} from "./sessions.functions";
import type {
	CreateSessionInput,
	Session,
	StoredSession,
} from "./sessions.types";

const sessionKey = (sessionId: string) =>
	`${Configurations.redis.keyPrefix}:session:${sessionId}`;

const activeSessionsKey = (userId: string) =>
	`${Configurations.redis.keyPrefix}:user:${userId}:active-sessions`;

const toStoredSession = (values: Record<string, string>): StoredSession | null => {
	if (
		!values.id ||
		!values.tokenHash ||
		!values.userId ||
		!values.createdAt
	) {
		return null;
	}

	return {
		id: values.id,
		tokenHash: values.tokenHash,
		active: values.active === "1",
		logoutAt: values.logoutAt || null,
		userId: values.userId,
		ipAddress: values.ipAddress || null,
		userAgent: values.userAgent || null,
		createdAt: values.createdAt,
	};
};

const toSession = ({ tokenHash: _tokenHash, ...session }: StoredSession) =>
	session;

const getStoredSession = async (id: string): Promise<StoredSession | null> => {
	const client = await getRedis();
	const values = await client.hGetAll(sessionKey(id));
	return toStoredSession(values);
};

const createSession = async (
	input: CreateSessionInput,
): Promise<Session & { token: string }> => {
	const client = await getRedis();
	const id = crypto.randomUUID();
	const token = generateSessionToken();
	const createdAt = new Date().toISOString();
	const storedSession: StoredSession = {
		id,
		tokenHash: hashSessionToken(token),
		active: true,
		logoutAt: null,
		userId: input.userId,
		ipAddress: input.ipAddress,
		userAgent: input.userAgent,
		createdAt,
	};

	await client
		.multi()
		.hSet(sessionKey(id), {
			id: storedSession.id,
			tokenHash: storedSession.tokenHash,
			active: "1",
			logoutAt: "",
			userId: storedSession.userId,
			ipAddress: storedSession.ipAddress ?? "",
			userAgent: storedSession.userAgent ?? "",
			createdAt: storedSession.createdAt,
		})
		.sAdd(activeSessionsKey(input.userId), id)
		.exec();

	return { ...toSession(storedSession), token };
};

const getSession = async (id: string): Promise<Session | null> => {
	const session = await getStoredSession(id);
	return session ? toSession(session) : null;
};

const getAllActiveSessions = async (userId: string): Promise<Session[]> => {
	const client = await getRedis();
	const indexKey = activeSessionsKey(userId);
	const sessionIds = await client.sMembers(indexKey);
	if (sessionIds.length === 0) return [];

	const storedSessions = await Promise.all(sessionIds.map(getStoredSession));
	const staleSessionIds: string[] = [];
	const sessions: Session[] = [];

	for (const [index, storedSession] of storedSessions.entries()) {
		if (
			!storedSession ||
			!storedSession.active ||
			storedSession.userId !== userId
		) {
			const staleSessionId = sessionIds[index];
			if (staleSessionId) staleSessionIds.push(staleSessionId);
			continue;
		}

		sessions.push(toSession(storedSession));
	}

	if (staleSessionIds.length > 0) {
		await client.sRem(indexKey, staleSessionIds);
	}

	return sessions.sort((left, right) =>
		right.createdAt.localeCompare(left.createdAt),
	);
};

const disableSession = async (id: string): Promise<Session | null> => {
	const storedSession = await getStoredSession(id);
	if (!storedSession) return null;
	if (!storedSession.active) return toSession(storedSession);

	const client = await getRedis();
	const logoutAt = new Date().toISOString();
	await client
		.multi()
		.hSet(sessionKey(id), { active: "0", logoutAt })
		.sRem(activeSessionsKey(storedSession.userId), id)
		.exec();

	return toSession({ ...storedSession, active: false, logoutAt });
};

const verifySession = async (
	id: string,
	token: string,
): Promise<Session | null> => {
	const storedSession = await getStoredSession(id);
	if (
		!storedSession ||
		!storedSession.active ||
		!sessionTokenMatchesHash(token, storedSession.tokenHash)
	) {
		return null;
	}

	return toSession(storedSession);
};

const sessionRepository = {
	createSession,
	disableSession,
	getAllActiveSessions,
	getSession,
	verifySession,
};

export { sessionRepository };
