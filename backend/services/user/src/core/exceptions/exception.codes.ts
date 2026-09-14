const ExceptionCodes = {
	something_went_wrong: "exception_something_went_wrong",
	exception_something_went_wrong: "exception_something_went_wrong",
	unauthorized: "exception_unauthorized",
	exception_unauthorized: "exception_unauthorized",
	incorrect_email_or_password: "exception_incorrect_email_or_password",
	exception_incorrect_email_or_password:
		"exception_incorrect_email_or_password",
	email_already_exists: "exception_email_already_exists",
	exception_email_already_exists: "exception_email_already_exists",
	username_already_exists: "exception_username_already_exists",
	exception_username_already_exists: "exception_username_already_exists",
	verification_not_found_or_expired:
		"exception_verification_not_found_or_expired",
	exception_verification_not_found_or_expired:
		"exception_verification_not_found_or_expired",
	verification_expired: "exception_verification_expired",
	exception_verification_expired: "exception_verification_expired",
	invalid_verification_data: "exception_invalid_verification_data",
	exception_invalid_verification_data: "exception_invalid_verification_data",
	verification_already_used: "exception_verification_already_used",
	exception_verification_already_used: "exception_verification_already_used",
	verification_not_completed: "exception_verification_not_completed",
	exception_verification_not_completed: "exception_verification_not_completed",
	invalid_verification_code: "exception_invalid_verification_code",
	exception_invalid_verification_code: "exception_invalid_verification_code",
	verification_attempts_limit_reached:
		"exception_verification_attempts_limit_reached",
	exception_verification_attempts_limit_reached:
		"exception_verification_attempts_limit_reached",
	verification_code_resends_limit_reached:
		"exception_verification_code_resends_limit_reached",
	exception_verification_code_resends_limit_reached:
		"exception_verification_code_resends_limit_reached",
	user_not_found: "exception_user_not_found",
	exception_user_not_found: "exception_user_not_found",
	current_password_incorrect: "exception_current_password_incorrect",
	exception_current_password_incorrect: "exception_current_password_incorrect",
	cannot_block_yourself: "exception_cannot_block_yourself",
	exception_cannot_block_yourself: "exception_cannot_block_yourself",
	email_unchanged: "exception_email_unchanged",
	exception_email_unchanged: "exception_email_unchanged",
	cannot_follow_yourself: "exception_cannot_follow_yourself",
	exception_cannot_follow_yourself: "exception_cannot_follow_yourself",
	cannot_follow_blocked_user: "exception_cannot_follow_blocked_user",
	exception_cannot_follow_blocked_user: "exception_cannot_follow_blocked_user",
} as const;

export { ExceptionCodes };
