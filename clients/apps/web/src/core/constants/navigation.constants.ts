import {
	RiBookmarkLine,
	RiChat3Line,
	RiHomeLine,
	RiNotification3Line,
	RiSearchLine,
} from "@remixicon/react";

export type NavItem = {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
	{ label: "Home", to: "/home", icon: RiHomeLine },
	{ label: "Search", to: "/search", icon: RiSearchLine },
	{ label: "Notifications", to: "/notifications", icon: RiNotification3Line },
	{ label: "Discussions", to: "/discussions", icon: RiChat3Line },
	{ label: "Bookmarks", to: "/bookmarks", icon: RiBookmarkLine },
];
