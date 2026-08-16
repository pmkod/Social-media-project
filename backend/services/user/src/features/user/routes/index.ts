import { followUserRoute } from "./follow-user.route";
import { getFollowingIdsRoute } from "./get-following-ids.route";
import { getMeRoute } from "./get-me.route";
import { getUserByIdRoute } from "./get-user-by-id.route";
import { getUserByUsernameRoute } from "./get-user-by-username.route";
import { getUserFollowersRoute } from "./get-user-followers.route";
import { getUserFollowingRoute } from "./get-user-following.route";
import { getUsersBatchRoute } from "./get-users-batch.route";
import { unfollowUserRoute } from "./unfollow-user.route";
import { updatePostCountRoute } from "./update-post-count.route";
import { updateProfileRoute } from "./update-profile.route";

const userRoutes = [
	getMeRoute,
	getUserByUsernameRoute,
	getUserByIdRoute,
	getUserFollowersRoute,
	getUserFollowingRoute,
	getUsersBatchRoute,
	updateProfileRoute,
	followUserRoute,
	unfollowUserRoute,
	updatePostCountRoute,
	getFollowingIdsRoute,
];

export { userRoutes };
