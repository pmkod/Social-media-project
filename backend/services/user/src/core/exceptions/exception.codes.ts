const ExceptionCodes = {
	something_went_wrong: "something_went_wrong",
	unauthorized: "unauthorized",
	incorrect_email_or_password: "incorrect_email_or_password",
	email_already_exists: "email_already_exists",
	username_already_exists: "username_already_exists",
	verification_not_found_or_expired: "verification_not_found_or_expired",
	verification_expired: "verification_expired",
	invalid_verification_data: "invalid_verification_data",
	verification_already_used: "verification_already_used",
	verification_not_completed: "verification_not_completed",
	invalid_verification_code: "invalid_verification_code",
	verification_attempts_limit_reached: "verification_attempts_limit_reached",
	verification_code_resends_limit_reached:
		"verification_code_resends_limit_reached",
	user_not_found: "user_not_found",
	current_password_incorrect: "current_password_incorrect",
	cannot_block_yourself: "cannot_block_yourself",
	email_unchanged: "email_unchanged",
	cannot_follow_yourself: "cannot_follow_yourself",
	cannot_follow_blocked_user: "cannot_follow_blocked_user",
} as const;

export { ExceptionCodes };
