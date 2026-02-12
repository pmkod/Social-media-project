import { USER_VERIFICATION_GOALS } from "./authentication.constants";

type UserVerificationGoalsKeys = keyof typeof USER_VERIFICATION_GOALS;
type UserVerificationGoal =
  (typeof USER_VERIFICATION_GOALS)[UserVerificationGoalsKeys];

export type { UserVerificationGoal };
