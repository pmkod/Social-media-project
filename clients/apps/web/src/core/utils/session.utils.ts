import { SessionStorageKeys } from "@/core/constants/authorization.constants.ts";

type SessionCredentials = {
	sessionId: string;
	sessionToken: string;
};

const getSessionId = () => localStorage.getItem(SessionStorageKeys.sessionId);

const getSessionToken = () =>
	localStorage.getItem(SessionStorageKeys.sessionToken);

const getSessionCredentials = (): SessionCredentials | null => {
	const sessionId = getSessionId();
	const sessionToken = getSessionToken();
	return sessionId && sessionToken ? { sessionId, sessionToken } : null;
};

const saveSessionCredentials = ({
	sessionId,
	sessionToken,
}: SessionCredentials) => {
	localStorage.setItem(SessionStorageKeys.sessionId, sessionId);
	localStorage.setItem(SessionStorageKeys.sessionToken, sessionToken);
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};

const deleteSessionCredentials = () => {
	localStorage.removeItem(SessionStorageKeys.sessionId);
	localStorage.removeItem(SessionStorageKeys.sessionToken);
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};

const createSessionAuthorizationHeader = ({
	sessionId,
	sessionToken,
}: SessionCredentials) => `Session ${sessionId}.${sessionToken}`;

export type { SessionCredentials };
export {
	createSessionAuthorizationHeader,
	deleteSessionCredentials,
	getSessionCredentials,
	getSessionId,
	saveSessionCredentials,
};
