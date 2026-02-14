import { Outlet } from "react-router";
import { Footer } from "../components/partials/footer";
import { Header } from "../components/partials/header";

const MainLayout = () => {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
};

export default MainLayout;
