const AuthenticationRoutesTag = "Authentication";

const UserVerificationGoals = {
	signup: "signup",
	login: "login",
	passwordReset: "password_reset",
} as const;

export { AuthenticationRoutesTag, UserVerificationGoals };
