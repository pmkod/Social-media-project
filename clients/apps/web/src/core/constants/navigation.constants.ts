import {
	IconBell,
	IconBookmark,
	IconCompass,
	IconHome,
	IconMessageCircle,
} from "@tabler/icons-react";

export interface NavItem {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
	{ label: "Home", to: "/home", icon: IconHome },
	{ label: "Explorer", to: "/explore", icon: IconCompass },
	{ label: "Notifications", to: "/notifications", icon: IconBell },
	{ label: "Discussions", to: "/discussions", icon: IconMessageCircle },
	{ label: "Bookmarks", to: "/bookmarks", icon: IconBookmark },
];
