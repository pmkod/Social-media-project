export const AuthenticationRoutesTag = "Authentication";

export const UserVerificationGoals = {
	signup: "signup",
	login: "login",
	passwordReset: "passwordReset",
} as const;

export const MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS = 3;
export const USER_VERIFICATION_DURATION_IN_MINUTES = 10;
