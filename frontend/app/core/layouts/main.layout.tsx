import { Outlet } from "react-router";
import { Sidebar } from "../components/partials/sidebar";

const MainLayout = () => {
	return (
		<div className="flex items-start mx-auto max-w-screen-2xl w-full gap-7">
			<Sidebar />
			<Outlet />
		</div>
	);
};

export default MainLayout;
