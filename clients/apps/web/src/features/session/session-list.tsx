import { RiComputerLine, RiLogoutBoxLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import {
	deleteSessionCredentials,
	getSessionId,
} from "@/core/utils/session.utils.ts";
import type { Session } from "./common/session.ts";
import { useActiveSessions } from "./use-active-sessions.ts";
import { useDisableSession } from "./use-disable-session.ts";
import { useLogoutOtherSessions } from "./use-logout-other-sessions.ts";

const sessionDateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});

const getSessionName = (session: Session) => {
	const userAgent = session.userAgent?.toLowerCase() ?? "";
	if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
		return "Apple mobile device";
	}
	if (userAgent.includes("android")) return "Android device";
	if (userAgent.includes("firefox")) return "Firefox browser";
	if (userAgent.includes("edg/")) return "Microsoft Edge browser";
	if (userAgent.includes("chrome")) return "Chrome browser";
	if (userAgent.includes("safari")) return "Safari browser";
	return "Unknown device";
};

function SessionRow({
	session,
	isCurrent,
	onDisable,
	isDisabling,
}: {
	session: Session;
	isCurrent: boolean;
	onDisable: () => void;
	isDisabling: boolean;
}) {
	return (
		<div className="flex items-start gap-3 border-t border-border px-4 py-4 sm:px-5">
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
				isLoading={isDisabling}
				onClick={onDisable}
			>
				{!isDisabling ? <RiLogoutBoxLine /> : null}
				{isCurrent ? "Log out" : "Disable"}
			</Button>
		</div>
	);
}

function SessionList() {
	const activeSessions = useActiveSessions();
	const disableSession = useDisableSession();
	const logoutOtherSessions = useLogoutOtherSessions();
	const currentSessionId = getSessionId();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const sessions = activeSessions.data ?? [];
	const otherSessionsCount = sessions.filter(
		(session) => session.id !== currentSessionId,
	).length;

	const handleDisable = async (session: Session) => {
		try {
			await disableSession.mutateAsync(session.id);
			if (session.id === currentSessionId) {
				deleteSessionCredentials();
				queryClient.clear();
				await navigate({ to: "/" });
				return;
			}
			toast.success("Session disabled");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to disable session",
			);
		}
	};

	const handleLogoutOthers = async () => {
		try {
			const { disabledCount } = await logoutOtherSessions.mutateAsync();
			toast.success(
				disabledCount === 1
					? "1 other session was disconnected"
					: `${disabledCount} other sessions were disconnected`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to disconnect other sessions",
			);
		}
	};

	return (
		<section className="mt-8 overflow-hidden rounded-xl border border-border">
			<div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
				<div>
					<h2 className="font-semibold">Active sessions</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Review the devices currently signed in to your account.
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					colorScheme="destructive"
					size="sm"
					disabled={otherSessionsCount === 0}
					isLoading={logoutOtherSessions.isPending}
					onClick={() => void handleLogoutOthers()}
				>
					{!logoutOtherSessions.isPending ? <RiLogoutBoxLine /> : null}
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
						isDisabling={
							disableSession.isPending &&
							disableSession.variables === session.id
						}
						onDisable={() => void handleDisable(session)}
					/>
				))
			)}
		</section>
	);
}

export { SessionList };
