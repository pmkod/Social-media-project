import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { UserVerificationForm } from "@/features/authentication/user-verification/user-verification.form";
import {
	UserVerificationGoals,
	UserVerificationGoalsValues,
} from "@/features/authentication/user-verification/user-verification-gloal";

const UserVerificationPageSearchParams = z.object({
	goal: z.enum(UserVerificationGoalsValues),
});

export const Route = createFileRoute(
	"/_base/_authentication/user-verification",
)({
	validateSearch: UserVerificationPageSearchParams,
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { goal } = Route.useSearch();

	const handleSuccess = async () => {
		if (goal === UserVerificationGoals.login) {
			await navigate({ to: "/home" });
		} else if (goal === UserVerificationGoals.signup) {
			await navigate({ to: "/complete-signup" });
		} else {
			await navigate({ to: "/new-password" });
		}
	};

	return <UserVerificationForm onSuccess={handleSuccess} goal={goal} />;
}
