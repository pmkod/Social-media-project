export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
};

export type AuthenticatedResponse = {
	session: {
		id: string;
		token: string;
	};
};

export type VerificationGoal = 'login' | 'signup' | 'password_reset';

export type UserVerification = {
  id: string;
  token: string;
};
