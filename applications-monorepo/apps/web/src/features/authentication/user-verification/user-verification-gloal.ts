const UserVerificationGoals = {
	login: "login",
	signup: "signup",
	passwordReset: "password_reset",
	emailChange: "email_change",
} as const;

const UserVerificationGoalsValues = Object.values(UserVerificationGoals);

export { UserVerificationGoals, UserVerificationGoalsValues };
