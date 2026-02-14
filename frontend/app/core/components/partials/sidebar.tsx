import { routesBuilder } from "@/core/routes-builder";
import { LoggedInUserDropdownMenu } from "@/features/user/components/logged-in-user.dropdown-menu";
import { userData } from "@/features/user/pages/user-profile.page";
import { Compass, Home, MessageCircleMore, Settings, User } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "../logo";

type SidebarLinkProps = {
	icon: ReactNode;
	path: string;
	name: string;
};

const SidebarLink = ({ icon, path, name }: SidebarLinkProps) => {
	return (
		<Link
			to={path}
			className="py-2 px-4 rounded hover:bg-gray-100 flex items-center gap-x-5 transition-colors"
		>
			{icon}
			<span className="text-lg font-normal text-gray-800">{name}</span>
		</Link>
	);
};

const Sidebar = () => {
	return (
		<div className="w-72 h-screen flex flex-col sticky top-0 pt-7">
			<div className="pl-4 pb-7">
				<Logo />
			</div>
			<div className="flex-1">
				<SidebarLink icon={<Home />} path={routesBuilder.home} name="Home" />
				<SidebarLink
					icon={<Compass />}
					path={routesBuilder.home}
					name="Explore"
				/>
				<SidebarLink
					icon={<MessageCircleMore />}
					path={routesBuilder.home}
					name="Discussions"
				/>

				<SidebarLink
					icon={<User />}
					path={routesBuilder.userProfile("p")}
					name="Profile"
				/>
				<SidebarLink
					icon={<Settings />}
					path={routesBuilder.home}
					name="Settings"
				/>
			</div>
			<div className="pb-4 w-full">
				<LoggedInUserDropdownMenu user={userData} />
			</div>
		</div>
	);
};

export { Sidebar };
