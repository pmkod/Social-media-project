const AuthenticationRoutesTag = "Authentication";

const UserVerificationGoals = {
	signup: "signup",
	login: "login",
	passwordReset: "password_reset",
} as const;

const MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL = 5;

const MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS = 5;

export {
	AuthenticationRoutesTag,
	UserVerificationGoals,
	MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL,
	MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS,
};
