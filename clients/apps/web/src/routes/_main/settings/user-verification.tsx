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
import type { SettingsPath } from "@/features/setting/common/setting-row-item.tsx";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import { useCompleteEmailChange } from "@/features/user/change-email/use-complete-email-change.ts";
import { SettingsUserVerificationGoals } from "@/features/user/settings-user-verification/settings-user-verification.constants.ts";
import { SettingsUserVerificationForm } from "@/features/user/settings-user-verification/settings-user-verification.form.tsx";

const settingsUserVerificationGoalValues = [
	SettingsUserVerificationGoals.emailChange,
] as const;

type SettingsUserVerificationGoal =
	(typeof settingsUserVerificationGoalValues)[number];

const settingsUserVerificationSearchSchema = z.object({
	goal: z.enum(settingsUserVerificationGoalValues),
});

const pageConfigByGoal = {
	[SettingsUserVerificationGoals.emailChange]: {
		backTo: "/settings/change-email",
		title: "Verify email change",
	},
} as const satisfies Record<
	SettingsUserVerificationGoal,
	{ backTo: SettingsPath; title: string }
>;

export const Route = createFileRoute("/_main/settings/user-verification")({
	validateSearch: settingsUserVerificationSearchSchema,
	component: SettingsUserVerificationPage,
});

function SettingsUserVerificationPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const completeEmailChange = useCompleteEmailChange();
	const { goal } = Route.useSearch();
	const pageConfig = pageConfigByGoal[goal];

	const completeGoal = {
		[SettingsUserVerificationGoals.emailChange]: async () => {
			await completeEmailChange.mutateAsync();
			await queryClient.invalidateQueries({
				queryKey: authenticatedUserQueryKey,
			});
			toast.success("Email address updated");
			await navigate({ to: "/settings/account" });
		},
	} satisfies Record<SettingsUserVerificationGoal, () => Promise<void>>;

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to={pageConfig.backTo} />
					<AppHeaderTitle>{pageConfig.title}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="mt-8 max-w-xl pl-12">
				<SettingsUserVerificationForm onSuccess={completeGoal[goal]} />
			</div>
		</>
	);
}
