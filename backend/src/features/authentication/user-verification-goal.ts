import { UserVerificationGoals } from "./authentication.constants";

type UserVerificationGoalsKeys = keyof typeof UserVerificationGoals;
type UserVerificationGoal =
	(typeof UserVerificationGoals)[UserVerificationGoalsKeys];

export type { UserVerificationGoal };
