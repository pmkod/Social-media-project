import { UserToFollowRecommendation } from "@/features/user/components/user-to-follow-recommendation";
import { Outlet } from "react-router";

const WithRoightSIdeDefaultContentLayout = () => {
	return (
		<>
			<Outlet />
			<UserToFollowRecommendation />
		</>
	);
};

export default WithRoightSIdeDefaultContentLayout;
