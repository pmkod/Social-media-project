const ExceptionCodes = {
	something_went_wrong: "exception_something_went_wrong",
	exception_something_went_wrong: "exception_something_went_wrong",
	unauthorized: "exception_unauthorized",
	exception_unauthorized: "exception_unauthorized",
	session_not_found: "exception_session_not_found",
	exception_session_not_found: "exception_session_not_found",
	session_disable_failed: "exception_session_disable_failed",
	exception_session_disable_failed: "exception_session_disable_failed",
} as const;

export { ExceptionCodes };
