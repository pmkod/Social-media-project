const ExceptionCodes = {
	something_went_wrong: "something_went_wrong",
	unauthorized: "unauthorized",
	post_not_found: "post_not_found",
	comment_not_found: "comment_not_found",
	parent_comment_not_found: "parent_comment_not_found",
	cannot_delete_post: "cannot_delete_post",
	cannot_delete_comment: "cannot_delete_comment",
	collection_not_found: "collection_not_found",
	collection_name_already_exists: "collection_name_already_exists",
} as const;

export { ExceptionCodes };
