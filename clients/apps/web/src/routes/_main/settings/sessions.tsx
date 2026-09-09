import { RiComputerLine, RiLogoutBoxLine } from "@remixicon/react";
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
import { getSessionName } from "@/features/session/common/session.utils.ts";
import { DisableSessionAlertDialog } from "@/features/session/disable-session-alert-dialog.tsx";
import { LogoutOtherSessionsAlertDialog } from "@/features/session/logout-other-sessions-alert-dialog.tsx";
import { useActiveSessions } from "@/features/session/use-active-sessions.ts";

export const Route = createFileRoute("/_main/settings/sessions")({
	component: SessionsSettingsPage,
});

const sessionDateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});

function SessionRow({
	session,
	isCurrent,
	onDisable,
}: {
	session: Session;
	isCurrent: boolean;
	onDisable: () => void;
}) {
	return (
		<div className="flex items-start gap-3 px-4 py-4 sm:px-5">
			<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent">
				<RiComputerLine className="size-5" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="font-medium">{getSessionName(session)}</p>
					{isCurrent ? (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
							Current session
						</span>
					) : null}
				</div>
				<p className="mt-1 text-xs text-muted-foreground">
					{session.ipAddress ?? "Unknown IP address"} · Signed in{" "}
					{sessionDateFormatter.format(new Date(session.createdAt))}
				</p>
				{session.userAgent ? (
					<p className="mt-1 break-all text-[11px] leading-relaxed text-muted-foreground">
						{session.userAgent}
					</p>
				) : null}
			</div>
			<Button
				type="button"
				variant="outline"
				colorScheme="destructive"
				size="sm"
				onClick={onDisable}
			>
				<RiLogoutBoxLine />
				{isCurrent ? "Log out" : "Disable"}
			</Button>
		</div>
	);
}

function SessionsSettingsPage() {
	const activeSessions = useActiveSessions();
	const currentSessionId = getSessionId();
	const sessions = activeSessions.data ?? [];
	const otherSessionsCount = sessions.filter(
		(session) => session.id !== currentSessionId,
	).length;

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings/security" />
					<AppHeaderTitle>Sessions</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			<section className="overflow-hidden rounded-xl">
				<div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>{/* <h2 className="font-semibold">Active sessions</h2> */}</div>
					<Button
						type="button"
						variant="outline"
						colorScheme="destructive"
						size="sm"
						disabled={otherSessionsCount === 0}
						onClick={() => {
							void NiceModal.show(LogoutOtherSessionsAlertDialog);
						}}
					>
						<RiLogoutBoxLine />
						Log out all other sessions
					</Button>
				</div>

				{activeSessions.isPending ? (
					<div className="space-y-3 border-t border-border p-4 sm:p-5">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : activeSessions.isError ? (
					<ExceptionBlock
						bordered={false}
						title="Sessions unavailable"
						description="Your active sessions could not be loaded."
						onRefresh={() => void activeSessions.refetch()}
						isRefetching={activeSessions.isRefetching}
					/>
				) : sessions.length === 0 ? (
					<EmptyBlock
						bordered={false}
						title="No active session"
						description="No active device was found for this account."
					/>
				) : (
					sessions.map((session) => (
						<SessionRow
							key={session.id}
							session={session}
							isCurrent={session.id === currentSessionId}
							onDisable={() => {
								void NiceModal.show(DisableSessionAlertDialog, {
									session,
									isCurrent: session.id === currentSessionId,
								});
							}}
						/>
					))
				)}
			</section>
		</>
	);
}
