import {
	RiBookmarkLine,
	RiChat3Line,
	RiCompassLine,
	RiHomeLine,
	RiNotification3Line,
} from "@remixicon/react";

export type NavItem = {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
	{ label: "Home", to: "/home", icon: RiHomeLine },
	{ label: "Explorer", to: "/explore", icon: RiCompassLine },
	{ label: "Notifications", to: "/notifications", icon: RiNotification3Line },
	{ label: "Discussions", to: "/discussions", icon: RiChat3Line },
	{ label: "Bookmarks", to: "/bookmarks", icon: RiBookmarkLine },
];
