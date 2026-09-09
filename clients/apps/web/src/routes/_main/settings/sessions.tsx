import {
	RiArrowRightSLine,
	RiComputerLine,
	RiLogoutBoxLine,
	RiSmartphoneLine,
} from "@remixicon/react";
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

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: "always",
});

const relativeTimeUnits = [
	{ unit: "year" as const, milliseconds: 365 * 24 * 60 * 60 * 1000 },
	{ unit: "month" as const, milliseconds: 30 * 24 * 60 * 60 * 1000 },
	{ unit: "week" as const, milliseconds: 7 * 24 * 60 * 60 * 1000 },
	{ unit: "day" as const, milliseconds: 24 * 60 * 60 * 1000 },
	{ unit: "hour" as const, milliseconds: 60 * 60 * 1000 },
	{ unit: "minute" as const, milliseconds: 60 * 1000 },
	{ unit: "second" as const, milliseconds: 1000 },
];
const smallestRelativeTimeUnit =
	relativeTimeUnits[relativeTimeUnits.length - 1];

function formatSessionTime(createdAt: string) {
	const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime());
	const { unit, milliseconds } =
		relativeTimeUnits.find(
			({ milliseconds: unitMilliseconds }) => elapsed >= unitMilliseconds,
		) ?? smallestRelativeTimeUnit;
	const value = Math.max(1, Math.floor(elapsed / milliseconds));

	return relativeTimeFormatter.format(-value, unit);
}

function isMobileSession(session: Session) {
	const userAgent = session.userAgent?.toLowerCase() ?? "";
	return /android|iphone|ipad|mobile/.test(userAgent);
}

function SessionRow({
	session,
	isCurrent,
	onDisable,
}: {
	session: Session;
	isCurrent: boolean;
	onDisable: () => void;
}) {
	const DeviceIcon = isMobileSession(session)
		? RiSmartphoneLine
		: RiComputerLine;

	return (
		<div className="flex items-center gap-3 py-4">
			<div
				className={`flex shrink-0 items-center justify-center rounded-full border size-12  ${
					isCurrent
						? "border-primary/70 bg-primary/5 text-primary"
						: "border-border bg-background text-muted-foreground"
				}`}
			>
				<DeviceIcon className={isCurrent ? "size-7" : "size-6"} />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="font-medium leading-tight">{getSessionName(session)}</p>
					{isCurrent ? (
						<span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
							Active now
						</span>
					) : null}
				</div>
				<p className="mt-1 text-sm text-muted-foreground">
					{isCurrent ? "This device" : formatSessionTime(session.createdAt)}
				</p>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				aria-label={
					isCurrent ? "Log out of this session" : "Disable this session"
				}
				title={isCurrent ? "Log out of this session" : "Disable this session"}
				onClick={onDisable}
			>
				<RiArrowRightSLine className="size-6 text-muted-foreground" />
			</Button>
		</div>
	);
}

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
					<AppHeaderTitle>Sessions</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			{activeSessions.isPending ? (
				<div className="space-y-6">
					<section className="overflow-hidden rounded-xl border border-border">
						<div className="space-y-3 px-5 py-6 sm:px-6">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-5 w-full max-w-xl" />
						</div>
						<div className="border-t border-border p-5 sm:p-6">
							<Skeleton className="h-14 w-full" />
						</div>
					</section>
					<section className="overflow-hidden rounded-xl border border-border">
						<div className="space-y-3 px-5 py-6 sm:px-6">
							<Skeleton className="h-8 w-72" />
							<Skeleton className="h-5 w-full max-w-2xl" />
						</div>
					</section>
				</div>
			) : activeSessions.isError ? (
				<ExceptionBlock
					title="Sessions unavailable"
					description="Your active sessions could not be loaded."
					onRefresh={() => void activeSessions.refetch()}
					isRefetching={activeSessions.isRefetching}
				/>
			) : sessions.length === 0 ? (
				<EmptyBlock
					title="No active session"
					description="No active device was found for this account."
				/>
			) : (
				<div className="space-y-6">
					<section>
						<div className="space-y-1">
							<h2 className="text-2xl font-bold tracking-tight">
								Current active session
							</h2>
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								You&apos;re logged into this account on this device and are
								currently using it.
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
								This device&apos;s active session could not be identified.
							</p>
						)}
					</section>
					<hr />

					<section>
						<div className="space-y-4">
							<div className="space-y-1">
								<h2 className="text-2xl font-bold tracking-tight">
									Other sessions
								</h2>
								<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
									You&apos;re logged into this account on these devices and
									aren&apos;t currently using them.
								</p>
							</div>
							<Button
								type="button"
								variant="link"
								colorScheme="destructive"
								size="default"
								className="h-auto justify-start px-0 py-0 text-base"
								disabled={otherSessions.length === 0}
								onClick={() => {
									void NiceModal.show(LogoutOtherSessionsAlertDialog);
								}}
							>
								<RiLogoutBoxLine />
								Log out of all other sessions
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
								No other active sessions were found.
							</p>
						)}
					</section>
				</div>
			)}
		</>
	);
}
