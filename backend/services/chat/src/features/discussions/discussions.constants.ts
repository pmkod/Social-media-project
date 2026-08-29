const DiscussionsRoutesTag = "Discussions";
const DiscussionMembersRoutesTag = "Discussion members";

const DiscussionTypes = ["PRIVATE", "GROUP"] as const;
const EditableDiscussionMemberRoles = ["ADMIN", "MEMBER"] as const;

export {
	DiscussionMembersRoutesTag,
	DiscussionsRoutesTag,
	DiscussionTypes,
	EditableDiscussionMemberRoles,
};
