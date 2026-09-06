import type { AuthUser, UserVerification } from '@/core/auth/auth.types';
import {
  deleteStoredValue,
  getStoredValue,
  setStoredValue,
} from '@/core/storage/secure-storage';

const STORAGE_KEYS = {
  sessionId: 'chillspace.session-id',
  sessionToken: 'chillspace.session-token',
  legacyAccessToken: 'chillspace.access-token',
  legacyRefreshToken: 'chillspace.refresh-token',
  user: 'chillspace.user',
  verification: 'chillspace.user-verification',
} as const;

const sessionClearedListeners = new Set<() => void>();

export const getSessionId = () => getStoredValue(STORAGE_KEYS.sessionId);
export const getSessionToken = () => getStoredValue(STORAGE_KEYS.sessionToken);

export async function getSessionCredentials() {
  const [sessionId, sessionToken] = await Promise.all([getSessionId(), getSessionToken()]);
  return sessionId && sessionToken ? { sessionId, sessionToken } : null;
}

export async function saveSessionCredentials(sessionId: string, sessionToken: string) {
  await Promise.all([
    setStoredValue(STORAGE_KEYS.sessionId, sessionId),
    setStoredValue(STORAGE_KEYS.sessionToken, sessionToken),
    deleteStoredValue(STORAGE_KEYS.legacyAccessToken),
    deleteStoredValue(STORAGE_KEYS.legacyRefreshToken),
  ]);
}

export async function clearSessionStorage() {
  await Promise.all([
    deleteStoredValue(STORAGE_KEYS.sessionId),
    deleteStoredValue(STORAGE_KEYS.sessionToken),
    deleteStoredValue(STORAGE_KEYS.legacyAccessToken),
    deleteStoredValue(STORAGE_KEYS.legacyRefreshToken),
    deleteStoredValue(STORAGE_KEYS.user),
  ]);
  sessionClearedListeners.forEach((listener) => listener());
}

export function subscribeToSessionCleared(listener: () => void) {
  sessionClearedListeners.add(listener);
  return () => sessionClearedListeners.delete(listener);
}

export async function saveAuthUser(user: AuthUser) {
  await setStoredValue(STORAGE_KEYS.user, JSON.stringify(user));
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const value = await getStoredValue(STORAGE_KEYS.user);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveVerification(verification: UserVerification) {
  await setStoredValue(STORAGE_KEYS.verification, JSON.stringify(verification));
}

export async function getVerification(): Promise<UserVerification | null> {
  const value = await getStoredValue(STORAGE_KEYS.verification);
  if (!value) return null;

  try {
    return JSON.parse(value) as UserVerification;
  } catch {
    return null;
  }
}

export const clearVerification = () => deleteStoredValue(STORAGE_KEYS.verification);
