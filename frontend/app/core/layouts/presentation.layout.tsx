import { Link, Outlet } from "react-router";
import { Logo } from "../components/logo";
import { Footer } from "../components/partials/footer";

const PresentationLayout = () => {
	return (
		<>
			<header className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
				<Link to="/">
					<Logo />
				</Link>

				<div className=""></div>
			</header>

			<Outlet />
			<Footer />
		</>
	);
};

export default PresentationLayout;
