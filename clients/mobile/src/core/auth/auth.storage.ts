import type { AuthUser, UserVerification } from '@/core/auth/auth.types';
import {
  deleteStoredValue,
  getStoredValue,
  setStoredValue,
} from '@/core/storage/secure-storage';

const STORAGE_KEYS = {
  accessToken: 'chillspace.access-token',
  refreshToken: 'chillspace.refresh-token',
  user: 'chillspace.user',
  verification: 'chillspace.user-verification',
} as const;

const sessionClearedListeners = new Set<() => void>();

export const getAccessToken = () => getStoredValue(STORAGE_KEYS.accessToken);
export const getRefreshToken = () => getStoredValue(STORAGE_KEYS.refreshToken);

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    setStoredValue(STORAGE_KEYS.accessToken, accessToken),
    setStoredValue(STORAGE_KEYS.refreshToken, refreshToken),
  ]);
}

export async function clearSessionStorage() {
  await Promise.all([
    deleteStoredValue(STORAGE_KEYS.accessToken),
    deleteStoredValue(STORAGE_KEYS.refreshToken),
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
