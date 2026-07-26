import { signupRoute } from "./signup.route";
import { completeSignupRoute } from "./complete-signup.route";
import { loginRoute } from "./login.route";
import { completeLoginRoute } from "./complete-login.route";
import { doUserVerificationRoute } from "./do-user-verification.route";
import { resendUserVerificationCodeRoute } from "./resend-user-verification-code.route";
import { passwordResetRoute } from "./password-reset.route";
import { newPasswordRoute } from "./new-password.route";
import { refreshTokenRoute } from "./refresh-token.route";
import { logoutRoute } from "./logout.route";

const authenticationRoutes = [
	signupRoute,
	completeSignupRoute,
	loginRoute,
	completeLoginRoute,
	doUserVerificationRoute,
	resendUserVerificationCodeRoute,
	passwordResetRoute,
	newPasswordRoute,
	refreshTokenRoute,
	logoutRoute,
];

export { authenticationRoutes };
