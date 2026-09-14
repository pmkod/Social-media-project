import { isHTTPError } from "ky";
import * as m from "@/paraglide/messages.js";

type MessageFunction = () => string;

const exceptionMessages: Record<string, MessageFunction> = {
	blocked_relationship: m.exception_blocked_relationship,
	blocked_user_in_discussion: m.exception_blocked_user_in_discussion,
	blocked_user_in_group: m.exception_blocked_user_in_group,
	cannot_block_yourself: m.exception_cannot_block_yourself,
	cannot_delete_comment: m.exception_cannot_delete_comment,
	cannot_delete_post: m.exception_cannot_delete_post,
	cannot_follow_blocked_user: m.exception_cannot_follow_blocked_user,
	cannot_follow_yourself: m.exception_cannot_follow_yourself,
	collection_name_already_exists: m.exception_collection_name_already_exists,
	collection_not_found: m.exception_collection_not_found,
	comment_not_found: m.exception_comment_not_found,
	current_password_incorrect: m.exception_current_password_incorrect,
	deleted_message_edit_forbidden: m.exception_deleted_message_edit_forbidden,
	discussion_blocked: m.exception_discussion_blocked,
	discussion_not_found: m.exception_discussion_not_found,
	email_already_exists: m.exception_email_already_exists,
	email_unchanged: m.exception_email_unchanged,
	group_manager_required: m.exception_group_manager_required,
	group_member_not_found: m.exception_group_member_not_found,
	group_name_required: m.exception_group_name_required,
	group_operation_required: m.exception_group_operation_required,
	group_owner_cannot_be_removed: m.exception_group_owner_cannot_be_removed,
	group_owner_required_to_change_roles:
		m.exception_group_owner_required_to_change_roles,
	incorrect_email_or_password: m.exception_incorrect_email_or_password,
	insufficient_group_members: m.exception_insufficient_group_members,
	invalid_private_discussion_members:
		m.exception_invalid_private_discussion_members,
	invalid_verification_code: m.exception_invalid_verification_code,
	invalid_verification_data: m.exception_invalid_verification_data,
	member_cannot_leave_private_discussion:
		m.exception_member_cannot_leave_private_discussion,
	member_role_missing: m.exception_member_role_missing,
	message_not_found: m.exception_message_not_found,
	no_new_member: m.exception_no_new_member,
	own_blocked_state_only: m.exception_own_blocked_state_only,
	owner_cannot_change_own_role: m.exception_owner_cannot_change_own_role,
	owner_required_to_remove_admin: m.exception_owner_required_to_remove_admin,
	owner_role_change_forbidden: m.exception_owner_role_change_forbidden,
	parent_comment_not_found: m.exception_parent_comment_not_found,
	parent_message_not_found: m.exception_parent_message_not_found,
	post_not_found: m.exception_post_not_found,
	private_discussion_creation_failed:
		m.exception_private_discussion_creation_failed,
	private_discussion_details_forbidden:
		m.exception_private_discussion_details_forbidden,
	private_discussion_member_missing:
		m.exception_private_discussion_member_missing,
	private_discussion_recipient_missing:
		m.exception_private_discussion_recipient_missing,
	recipient_not_found: m.exception_recipient_not_found,
	sender_required_to_delete_message:
		m.exception_sender_required_to_delete_message,
	sender_required_to_edit_message: m.exception_sender_required_to_edit_message,
	session_disable_failed: m.exception_session_disable_failed,
	session_not_found: m.exception_session_not_found,
	something_went_wrong: m.exception_something_went_wrong,
	unauthorized: m.exception_unauthorized,
	user_not_found: m.exception_user_not_found,
	username_already_exists: m.exception_username_already_exists,
	users_not_found: m.exception_users_not_found,
	verification_already_used: m.exception_verification_already_used,
	verification_attempts_limit_reached:
		m.exception_verification_attempts_limit_reached,
	verification_code_resends_limit_reached:
		m.exception_verification_code_resends_limit_reached,
	verification_expired: m.exception_verification_expired,
	verification_not_completed: m.exception_verification_not_completed,
	verification_not_found_or_expired:
		m.exception_verification_not_found_or_expired,
};

function translateExceptionCode(code: unknown): string {
	if (typeof code !== "string") return m.exception_something_went_wrong();

	return exceptionMessages[code]?.() ?? m.exception_something_went_wrong();
}

function getExceptionCode(data: unknown): unknown {
	if (
		typeof data !== "object" ||
		data === null ||
		!("error" in data) ||
		typeof data.error !== "object" ||
		data.error === null ||
		!("code" in data.error)
	) {
		return undefined;
	}

	return data.error.code;
}

function getExceptionMessage(error: unknown): string {
	if (!isHTTPError(error)) return m.exception_something_went_wrong();

	return translateExceptionCode(getExceptionCode(error.data));
}

export { getExceptionMessage, translateExceptionCode };
