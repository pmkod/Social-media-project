import {
	RiComputerLine,
	RiLogoutBoxLine,
	RiSmartphoneLine,
} from "@remixicon/react";
import { Button } from "@/core/components/ui/button.tsx";
import type { Session } from "../common/session.ts";
import { getSessionName } from "../common/session.utils.ts";

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
	const userAgent = session.userAgent ?? "User agent unavailable";

	return (
		<div className="flex items-start gap-3 py-4">
			<div
				className={`flex size-12 shrink-0 items-center justify-center rounded-full border ${
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
					-{" "}
					<p className="text-xs text-muted-foreground">
						Created {formatSessionTime(session.createdAt)}
					</p>
				</div>

				<p
					className="mt-1 line-clamp-2 break-all text-xs leading-relaxed text-muted-foreground"
					title={session.userAgent ?? undefined}
				>
					<span className="font-medium text-foreground/70">User agent:</span>{" "}
					{userAgent}
				</p>
			</div>
			<Button
				type="button"
				variant="outline"
				colorScheme="destructive"
				size="sm"
				className="mt-1"
				aria-label="Log out of this session"
				title="Log out of this session"
				onClick={onDisable}
			>
				<RiLogoutBoxLine />
				<span className="hidden sm:inline">Log out</span>
			</Button>
		</div>
	);
}

export { SessionRow };
