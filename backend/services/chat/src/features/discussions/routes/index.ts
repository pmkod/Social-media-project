import { addDiscussionMembersRoute } from "./add-discussion-members.route";
import { createDiscussionRoute } from "./create-discussion.route";
import { deleteDiscussionRoute } from "./delete-discussion.route";
import { getDiscussionRoute } from "./get-discussion.route";
import { getDiscussionMediaRoute } from "./get-discussion-media.route";
import { getDiscussionsRoute } from "./get-discussions.route";
import { markDiscussionReadRoute } from "./mark-discussion-read.route";
import { removeDiscussionMemberRoute } from "./remove-discussion-member.route";
import { updateDiscussionMemberRoute } from "./update-discussion-member.route";
import { updateDiscussionRoute } from "./update-discussion.route";

const discussionsRoutes = [
	getDiscussionsRoute,
	createDiscussionRoute,
	markDiscussionReadRoute,
	addDiscussionMembersRoute,
	updateDiscussionMemberRoute,
	removeDiscussionMemberRoute,
	getDiscussionRoute,
	getDiscussionMediaRoute,
	updateDiscussionRoute,
	deleteDiscussionRoute,
];

export { discussionsRoutes };
