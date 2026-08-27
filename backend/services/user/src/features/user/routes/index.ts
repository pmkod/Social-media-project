import { blockUserRoute } from "./block-user.route";
import { changeEmailRoute } from "./change-email.route";
import { changePasswordRoute } from "./change-password.route";
import { checkUserExistsRoute } from "./check-user-exists.route";
import { followUserRoute } from "./follow-user.route";
import { getBlockRelationshipIdsRoute } from "./get-block-relationship-ids.route";
import { getBlockedUsersRoute } from "./get-blocked-users.route";
import { getFollowSuggestionsRoute } from "./get-follow-suggestions.route";
import { getFollowingIdsRoute } from "./get-following-ids.route";
import { getMeRoute } from "./get-me.route";
import { getUserByIdRoute } from "./get-user-by-id.route";
import { getUserByUsernameRoute } from "./get-user-by-username.route";
import { getUserFollowersRoute } from "./get-user-followers.route";
import { getUserFollowingRoute } from "./get-user-following.route";
import { getUsersBatchRoute } from "./get-users-batch.route";
import { requestEmailChangeRoute } from "./request-email-change.route";
import { searchUsersRoute } from "./search-users.route";
import { unblockUserRoute } from "./unblock-user.route";
import { unfollowUserRoute } from "./unfollow-user.route";
import { updatePostCountRoute } from "./update-post-count.route";
import { updateProfileRoute } from "./update-profile.route";
import { updateUnseenNotificationsCountRoute } from "./update-unseen-notifications-count.route";

const userRoutes = [
	getMeRoute,
	getBlockedUsersRoute,
	getFollowSuggestionsRoute,
	searchUsersRoute,
	getUserByUsernameRoute,
	getUserByIdRoute,
	getUserFollowersRoute,
	getUserFollowingRoute,
	getUsersBatchRoute,
	updateProfileRoute,
	changePasswordRoute,
	requestEmailChangeRoute,
	changeEmailRoute,
	followUserRoute,
	unfollowUserRoute,
	blockUserRoute,
	unblockUserRoute,
	updatePostCountRoute,
	updateUnseenNotificationsCountRoute,
	getFollowingIdsRoute,
	getBlockRelationshipIdsRoute,
	checkUserExistsRoute,
];

export { userRoutes };
