import * as m from "@/paraglide/messages.js";
import type { Session } from "./session.ts";

const getSessionName = (session: Session) => {
	const userAgent = session.userAgent?.toLowerCase() ?? "";
	if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
		return m.settings_device_apple();
	}
	if (userAgent.includes("android")) return m.settings_device_android();
	if (userAgent.includes("firefox")) return m.settings_device_firefox();
	if (userAgent.includes("edg/")) return m.settings_device_edge();
	if (userAgent.includes("chrome")) return m.settings_device_chrome();
	if (userAgent.includes("safari")) return m.settings_device_safari();
	return m.settings_device_unknown();
};

export { getSessionName };
