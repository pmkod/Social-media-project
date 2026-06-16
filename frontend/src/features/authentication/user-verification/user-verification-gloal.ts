const UserVerificationGoals = {
	login: "login",
	signup: "signup",
	passwordReset: "password_reset",
} as const;

const UserVerificationGoalsValues = Object.values(UserVerificationGoals);

export { UserVerificationGoals, UserVerificationGoalsValues };
