const ExceptionCodes = {
	something_went_wrong: "exception_something_went_wrong",
	exception_something_went_wrong: "exception_something_went_wrong",
	unauthorized: "exception_unauthorized",
	exception_unauthorized: "exception_unauthorized",
	post_not_found: "exception_post_not_found",
	exception_post_not_found: "exception_post_not_found",
	comment_not_found: "exception_comment_not_found",
	exception_comment_not_found: "exception_comment_not_found",
	parent_comment_not_found: "exception_parent_comment_not_found",
	exception_parent_comment_not_found: "exception_parent_comment_not_found",
	cannot_delete_post: "exception_cannot_delete_post",
	exception_cannot_delete_post: "exception_cannot_delete_post",
	cannot_delete_comment: "exception_cannot_delete_comment",
	exception_cannot_delete_comment: "exception_cannot_delete_comment",
	collection_not_found: "exception_collection_not_found",
	exception_collection_not_found: "exception_collection_not_found",
	collection_name_already_exists: "exception_collection_name_already_exists",
	exception_collection_name_already_exists:
		"exception_collection_name_already_exists",
} as const;

export { ExceptionCodes };
