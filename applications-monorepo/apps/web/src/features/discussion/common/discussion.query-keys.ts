const discussionQueryKeys = {
	root: ["discussions"] as const,
	listsRoot: ["discussions", "list"] as const,
	list: (limit: number) => ["discussions", "list", { limit }] as const,
	detail: (discussionId: string) =>
		["discussions", "detail", discussionId] as const,
	messages: (discussionId: string, limit: number) =>
		["discussion-messages", discussionId, { limit }] as const,
	messagesRoot: (discussionId: string) =>
		["discussion-messages", discussionId] as const,
	media: (discussionId: string, limit: number) =>
		["discussion-media", discussionId, { limit }] as const,
	mediaRoot: (discussionId: string) =>
		["discussion-media", discussionId] as const,
};

export { discussionQueryKeys };
