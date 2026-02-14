import { Card } from "@/core/components/ui/card";
import { Outlet } from "react-router";

const AuthenticationLayout = () => {
	return (
		<div className="px-7 pt-32 pb-52">
			<Card className="w-full md:w-lg mx-auto px-3">
				<Outlet />
			</Card>
		</div>
	);
};

export default AuthenticationLayout;
