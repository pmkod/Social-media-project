export const UserVerificationGoals = {
	login: "login",
	signup: "signup",
	passwordReset: "password_reset",
	emailChange: "email_change",
} as const;

export const UserVerificationGoalsValues = Object.values(UserVerificationGoals);

export type UserVerificationGoalType =
	(typeof UserVerificationGoals)[keyof typeof UserVerificationGoals];
