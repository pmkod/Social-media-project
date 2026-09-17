import { RiLogoutBoxLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { getSessionId } from "@/core/utils/session.utils.ts";
import type { Session } from "@/features/session/common/session.ts";
import { DisableSessionAlertDialog } from "@/features/session/disable-session/disable-session-alert-dialog.tsx";
import { SessionRow } from "@/features/session/list-active-sessions/session-row";
import { useActiveSessions } from "@/features/session/list-active-sessions/use-active-sessions.ts";
import { LogoutOtherSessionsAlertDialog } from "@/features/session/logout-other-sessions/logout-other-sessions-alert-dialog.tsx";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/sessions")({
	component: SessionsSettingsPage,
});

function SessionsSettingsPage() {
	const activeSessions = useActiveSessions();
	const currentSessionId = getSessionId();
	const sessions = activeSessions.data ?? [];
	const currentSession = sessions.find(
		(session) => session.id === currentSessionId,
	);
	const otherSessions = sessions.filter(
		(session) => session.id !== currentSessionId,
	);

	const showSessionDialog = (session: Session, isCurrent: boolean) => {
		void NiceModal.show(DisableSessionAlertDialog, {
			session,
			isCurrent,
		});
	};

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings/security" />
					<AppHeaderTitle>{m.settings_sessions()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			{activeSessions.isPending ? (
				<div className="space-y-2">
					<section className="overflow-hidden">
						<div className="space-y-3 py-6">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-5 w-full max-w-xl" />
						</div>
						<div className="pb-5">
							<Skeleton className="h-14 w-full" />
						</div>
					</section>
					<hr />
					<section className="overflow-hidden">
						<div className="space-y-3 py-6">
							<Skeleton className="h-8 w-72" />
							<Skeleton className="h-5 w-full max-w-2xl" />
						</div>
					</section>
				</div>
			) : activeSessions.isError ? (
				<ExceptionBlock
					title="Sessions unavailable"
					description={(activeSessions.error as Error)?.message}
					onRefresh={() => void activeSessions.refetch()}
					isRefetching={activeSessions.isRefetching}
				/>
			) : sessions.length === 0 ? (
				<EmptyBlock
					title={m.settings_no_active_session_title()}
					description={m.settings_no_active_session_description()}
				/>
			) : (
				<div className="space-y-6">
					<section>
						<div className="space-y-1">
							<h2 className="text-lg font-bold tracking-tight">
								{m.settings_current_session()}
							</h2>
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								{m.settings_current_session_description()}
							</p>
						</div>
						{currentSession ? (
							<SessionRow
								session={currentSession}
								isCurrent
								onDisable={() => showSessionDialog(currentSession, true)}
							/>
						) : (
							<p className="border-t border-border px-5 py-5 text-sm text-muted-foreground sm:px-6">
								{m.settings_current_session_unknown()}
							</p>
						)}
					</section>
					<hr />

					<section>
						<div className="space-y-4">
							<div className="space-y-1">
								<h2 className="text-lg font-bold tracking-tight">
									{m.settings_other_sessions()}
								</h2>
								<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
									{m.settings_other_sessions_description()}
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								colorScheme="destructive"
								size="sm"
								disabled={otherSessions.length === 0}
								onClick={() => {
									void NiceModal.show(LogoutOtherSessionsAlertDialog);
								}}
							>
								<RiLogoutBoxLine className="size-4" />
								{m.settings_logout_other_sessions()}
							</Button>
						</div>
						{otherSessions.length > 0 ? (
							<div>
								{otherSessions.map((session) => (
									<SessionRow
										key={session.id}
										session={session}
										isCurrent={false}
										onDisable={() => showSessionDialog(session, false)}
									/>
								))}
							</div>
						) : (
							<p className="border-t border-border px-5 py-5 text-sm text-muted-foreground sm:px-6">
								{m.settings_no_other_sessions()}
							</p>
						)}
					</section>
				</div>
			)}
		</>
	);
}
