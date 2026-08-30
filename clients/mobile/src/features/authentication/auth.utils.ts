import { getVerification, saveVerification } from '@/core/auth/auth.storage';
import type { UserVerification, VerificationGoal } from '@/core/auth/auth.types';

export async function requireVerification() {
  const verification = await getVerification();
  if (!verification) throw new Error('Verification data was not found. Please start again.');
  return verification;
}

export async function saveVerificationResponse(response: {
  userVerification?: UserVerification;
}) {
  if (!response.userVerification) return null;
  await saveVerification(response.userVerification);
  return response.userVerification;
}

export function isVerificationGoal(value: string | string[] | undefined): value is VerificationGoal {
  return value === 'login' || value === 'signup' || value === 'password_reset';
}
