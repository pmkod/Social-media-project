import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionStorageKeys } from "@/core/constants/authorization.constants";

export type SessionCredentials = {
	sessionId: string;
	sessionToken: string;
};

let cachedCredentials: SessionCredentials | null = null;
let isLoaded = false;

export const loadSessionCredentials = async (): Promise<SessionCredentials | null> => {
	try {
		const [sessionId, sessionToken] = await Promise.all([
			AsyncStorage.getItem(SessionStorageKeys.sessionId),
			AsyncStorage.getItem(SessionStorageKeys.sessionToken),
		]);
		if (sessionId && sessionToken) {
			cachedCredentials = { sessionId, sessionToken };
		} else {
			cachedCredentials = null;
		}
	} catch {
		cachedCredentials = null;
	}
	isLoaded = true;
	return cachedCredentials;
};

export const getSessionCredentials = async (): Promise<SessionCredentials | null> => {
	if (!isLoaded) {
		return await loadSessionCredentials();
	}
	return cachedCredentials;
};

export const getSessionCredentialsSync = (): SessionCredentials | null => {
	return cachedCredentials;
};

export const saveSessionCredentials = async ({
	sessionId,
	sessionToken,
}: SessionCredentials) => {
	cachedCredentials = { sessionId, sessionToken };
	await AsyncStorage.multiSet([
		[SessionStorageKeys.sessionId, sessionId],
		[SessionStorageKeys.sessionToken, sessionToken],
	]);
};

export const deleteSessionCredentials = async () => {
	cachedCredentials = null;
	await AsyncStorage.multiRemove([
		SessionStorageKeys.sessionId,
		SessionStorageKeys.sessionToken,
	]);
};

export const createSessionAuthorizationHeader = ({
	sessionId,
	sessionToken,
}: SessionCredentials) => `Session ${sessionId}.${sessionToken}`;
