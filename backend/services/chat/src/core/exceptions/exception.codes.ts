const ExceptionCodes = {
	something_went_wrong: "exception_something_went_wrong",
	exception_something_went_wrong: "exception_something_went_wrong",
	unauthorized: "exception_unauthorized",
	exception_unauthorized: "exception_unauthorized",
	discussion_not_found: "exception_discussion_not_found",
	exception_discussion_not_found: "exception_discussion_not_found",
	group_operation_required: "exception_group_operation_required",
	exception_group_operation_required: "exception_group_operation_required",
	group_manager_required: "exception_group_manager_required",
	exception_group_manager_required: "exception_group_manager_required",
	invalid_private_discussion_members:
		"exception_invalid_private_discussion_members",
	exception_invalid_private_discussion_members:
		"exception_invalid_private_discussion_members",
	insufficient_group_members: "exception_insufficient_group_members",
	exception_insufficient_group_members: "exception_insufficient_group_members",
	group_name_required: "exception_group_name_required",
	exception_group_name_required: "exception_group_name_required",
	private_discussion_details_forbidden:
		"exception_private_discussion_details_forbidden",
	exception_private_discussion_details_forbidden:
		"exception_private_discussion_details_forbidden",
	users_not_found: "exception_users_not_found",
	exception_users_not_found: "exception_users_not_found",
	blocked_user_in_discussion: "exception_blocked_user_in_discussion",
	exception_blocked_user_in_discussion: "exception_blocked_user_in_discussion",
	private_discussion_member_missing:
		"exception_private_discussion_member_missing",
	exception_private_discussion_member_missing:
		"exception_private_discussion_member_missing",
	private_discussion_creation_failed:
		"exception_private_discussion_creation_failed",
	exception_private_discussion_creation_failed:
		"exception_private_discussion_creation_failed",
	no_new_member: "exception_no_new_member",
	exception_no_new_member: "exception_no_new_member",
	blocked_user_in_group: "exception_blocked_user_in_group",
	exception_blocked_user_in_group: "exception_blocked_user_in_group",
	member_cannot_leave_private_discussion:
		"exception_member_cannot_leave_private_discussion",
	exception_member_cannot_leave_private_discussion:
		"exception_member_cannot_leave_private_discussion",
	group_member_not_found: "exception_group_member_not_found",
	exception_group_member_not_found: "exception_group_member_not_found",
	group_owner_cannot_be_removed: "exception_group_owner_cannot_be_removed",
	exception_group_owner_cannot_be_removed:
		"exception_group_owner_cannot_be_removed",
	owner_required_to_remove_admin: "exception_owner_required_to_remove_admin",
	exception_owner_required_to_remove_admin:
		"exception_owner_required_to_remove_admin",
	own_blocked_state_only: "exception_own_blocked_state_only",
	exception_own_blocked_state_only: "exception_own_blocked_state_only",
	group_owner_required_to_change_roles:
		"exception_group_owner_required_to_change_roles",
	exception_group_owner_required_to_change_roles:
		"exception_group_owner_required_to_change_roles",
	owner_cannot_change_own_role: "exception_owner_cannot_change_own_role",
	exception_owner_cannot_change_own_role:
		"exception_owner_cannot_change_own_role",
	owner_role_change_forbidden: "exception_owner_role_change_forbidden",
	exception_owner_role_change_forbidden:
		"exception_owner_role_change_forbidden",
	member_role_missing: "exception_member_role_missing",
	exception_member_role_missing: "exception_member_role_missing",
	message_not_found: "exception_message_not_found",
	exception_message_not_found: "exception_message_not_found",
	sender_required_to_delete_message:
		"exception_sender_required_to_delete_message",
	exception_sender_required_to_delete_message:
		"exception_sender_required_to_delete_message",
	discussion_blocked: "exception_discussion_blocked",
	exception_discussion_blocked: "exception_discussion_blocked",
	private_discussion_recipient_missing:
		"exception_private_discussion_recipient_missing",
	exception_private_discussion_recipient_missing:
		"exception_private_discussion_recipient_missing",
	recipient_not_found: "exception_recipient_not_found",
	exception_recipient_not_found: "exception_recipient_not_found",
	blocked_relationship: "exception_blocked_relationship",
	exception_blocked_relationship: "exception_blocked_relationship",
	parent_message_not_found: "exception_parent_message_not_found",
	exception_parent_message_not_found: "exception_parent_message_not_found",
	sender_required_to_edit_message: "exception_sender_required_to_edit_message",
	exception_sender_required_to_edit_message:
		"exception_sender_required_to_edit_message",
	deleted_message_edit_forbidden: "exception_deleted_message_edit_forbidden",
	exception_deleted_message_edit_forbidden:
		"exception_deleted_message_edit_forbidden",
} as const;

export { ExceptionCodes };
