export const UserVerificationGoals = {
	login: "LOGIN",
	signup: "SIGNUP",
	passwordReset: "PASSWORD_RESET",
} as const;

export const UserVerificationGoalsValues = [
	UserVerificationGoals.login,
	UserVerificationGoals.signup,
	UserVerificationGoals.passwordReset,
] as const;

export type UserVerificationGoalType =
	(typeof UserVerificationGoals)[keyof typeof UserVerificationGoals];
