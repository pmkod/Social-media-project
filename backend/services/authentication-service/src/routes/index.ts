import { completeLoginRoute } from "./complete-login.route";
import { completeSignupRoute } from "./complete-signup.route";
import { doUserVerificationRoute } from "./do-user-verification.route";
import { validateTokenRoute } from "./internal/validate-token.route";
import { loginRoute } from "./login.route";
import { passwordResetRoute } from "./password-reset.route";
import { signupRoute } from "./signup.route";

export const authenticationRoutes = [
	signupRoute,
	completeSignupRoute,
	loginRoute,
	completeLoginRoute,
	passwordResetRoute,
	doUserVerificationRoute,
	validateTokenRoute,
];
