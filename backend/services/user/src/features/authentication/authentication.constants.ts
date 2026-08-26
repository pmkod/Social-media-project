const AuthenticationRoutesTag = "Authentication";

const UserVerificationGoals = {
	signup: "signup",
	login: "login",
	passwordReset: "password_reset",
	emailChange: "email_change",
} as const;

const MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL = 5;

const MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS = 5;

const USER_VERIFICATION_LIFETIME_IN_MINUTES = 10;

export {
	AuthenticationRoutesTag,
	UserVerificationGoals,
	MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL,
	MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS,
	USER_VERIFICATION_LIFETIME_IN_MINUTES,
};
