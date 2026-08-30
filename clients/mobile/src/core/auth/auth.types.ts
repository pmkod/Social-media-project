export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
};

export type AuthenticatedResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type VerificationGoal = 'login' | 'signup' | 'password_reset';

export type UserVerification = {
  id: string;
  token: string;
};
