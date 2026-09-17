export const DiscussionTypes = {
	DIRECT: "DIRECT",
	GROUP: "GROUP",
} as const;

export type DiscussionType = (typeof DiscussionTypes)[keyof typeof DiscussionTypes];
