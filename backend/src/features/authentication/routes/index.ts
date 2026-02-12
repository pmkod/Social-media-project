import { OpenAPIHono } from "@hono/zod-openapi";
import { completeLoginRoute } from "./complete-login.route";
import { completeSignupRoute } from "./complete-signup.route";
import { doUserVerificationRoute } from "./do-user-verification.route";
import { generateNewAccessTokenRoute } from "./generate-new-access-token.route";
import { loginRoute } from "./login.route";
import { logoutRoute } from "./logout.route";
import { newPasswordRoute } from "./new-password.route";
import { passwordResetRoute } from "./password-reset.route";
import { resendUserVerificationCode } from "./resend-user-verification-code.route";
import { signupRoute } from "./signup.route";

const authenticationRouter = new OpenAPIHono()
	.basePath("/authentication")
	.route("/", loginRoute)
	.route("/", completeLoginRoute)
	.route("/", signupRoute)
	.route("/", completeSignupRoute)
	.route("/", passwordResetRoute)
	.route("/", newPasswordRoute)
	.route("/", generateNewAccessTokenRoute)
	.route("/", resendUserVerificationCode)
	.route("/", doUserVerificationRoute)
	.route("/", logoutRoute);

export { authenticationRouter };
