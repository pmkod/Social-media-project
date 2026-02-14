import { routesBuilder } from "@/core/routes-builder";
import { Compass, Home, MessageCircleMore, User } from "lucide-react";
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
		<div className="w-72 h-screen sticky top-0 pt-7">
			<div className="pl-4 pb-7">
				<Logo />
			</div>
			<div className="">
				<SidebarLink icon={<Home />} path={routesBuilder.home} name="Home" />
				<SidebarLink
					icon={<Compass />}
					path={routesBuilder.explore}
					name="Explore"
				/>
				<SidebarLink
					icon={<MessageCircleMore />}
					path={routesBuilder.discussions}
					name="Discussions"
				/>
				<SidebarLink
					icon={<Compass />}
					path={routesBuilder.explore}
					name="Explore"
				/>
				<SidebarLink
					icon={<User />}
					path={routesBuilder.userProfile("pmkod")}
					name="Profile"
				/>
			</div>
			<div></div>
		</div>
	);
};

export { Sidebar };
