import type { Session } from "./session.ts";

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

export { getSessionName };
