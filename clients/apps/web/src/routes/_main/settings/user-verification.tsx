import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import { useCompleteEmailChange } from "@/features/user/change-email/use-complete-email-change.ts";
import { SettingsUserVerificationForm } from "@/features/user/settings-user-verification/settings-user-verification.form.tsx";
import { UserVerificationGoals } from "@/features/authentication/user-verification/user-verification-gloal";

const settingsUserVerificationSearchSchema = z.object({
	goal: z.enum([UserVerificationGoals.emailChange]),
});

export const Route = createFileRoute("/_main/settings/user-verification")({
	validateSearch: settingsUserVerificationSearchSchema,
	component: SettingsUserVerificationPage,
});

function SettingsUserVerificationPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const completeEmailChange = useCompleteEmailChange();
	const { goal } = Route.useSearch();

	const onSuccess = async () => {
		if (goal === UserVerificationGoals.emailChange) {
			await completeEmailChange.mutateAsync();
			await queryClient.invalidateQueries({
				queryKey: authenticatedUserQueryKey,
			});
			toast.success("Email address updated");
			await navigate({ to: "/settings/account" });
		}
	};

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings/change-email" />
					<AppHeaderTitle>Verify email change</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="max-w-xl pl-12">
				<SettingsUserVerificationForm onSuccess={onSuccess} />
			</div>
		</>
	);
}
