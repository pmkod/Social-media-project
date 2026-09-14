import { isHTTPError } from 'ky';

const englishExceptionTranslations = {
  blocked_relationship:
    'You cannot interact with this user because one of you has blocked the other.',
  blocked_user_in_discussion:
    'A blocked user cannot be added to this discussion.',
  blocked_user_in_group: 'A blocked user cannot be added to this group.',
  cannot_block_yourself: 'You cannot block yourself.',
  cannot_delete_comment: 'You cannot delete this comment.',
  cannot_delete_post: 'You cannot delete this post.',
  cannot_follow_blocked_user:
    'You cannot follow this user because one of you has blocked the other.',
  cannot_follow_yourself: 'You cannot follow yourself.',
  collection_name_already_exists:
    'A collection with this name already exists.',
  collection_not_found: 'Collection not found.',
  comment_not_found: 'Comment not found.',
  current_password_incorrect: 'The current password is incorrect.',
  deleted_message_edit_forbidden: 'A deleted message cannot be edited.',
  discussion_blocked: 'You cannot send a message in this discussion.',
  discussion_not_found: 'Discussion not found.',
  email_already_exists: 'An account already uses this email address.',
  email_unchanged: 'The new email address must be different.',
  group_manager_required: 'Only a group manager can perform this action.',
  group_member_not_found: 'Group member not found.',
  group_name_required: 'A group name is required.',
  group_operation_required:
    'This action is only available for group discussions.',
  group_owner_cannot_be_removed: 'The group owner cannot be removed.',
  group_owner_required_to_change_roles:
    'Only the group owner can change member roles.',
  incorrect_email_or_password: 'Incorrect email or password.',
  insufficient_group_members:
    'A group discussion needs at least three members.',
  invalid_private_discussion_members:
    'A private discussion must contain exactly two members.',
  invalid_verification_code: 'The verification code is invalid.',
  invalid_verification_data: 'The verification request is invalid.',
  member_cannot_leave_private_discussion:
    'You cannot leave a private discussion.',
  member_role_missing: 'Please select a role for this member.',
  message_not_found: 'Message not found.',
  no_new_member: 'There are no new members to add.',
  own_blocked_state_only: 'You can only change your own blocked status.',
  owner_cannot_change_own_role:
    'The group owner cannot change their own role.',
  owner_required_to_remove_admin:
    'Only the group owner can remove an administrator.',
  owner_role_change_forbidden: "The group owner's role cannot be changed.",
  parent_comment_not_found: 'Parent comment not found.',
  parent_message_not_found: 'Parent message not found in this discussion.',
  post_not_found: 'Post not found.',
  private_discussion_creation_failed:
    'The private discussion could not be created.',
  private_discussion_details_forbidden:
    'A private discussion cannot have group details.',
  private_discussion_member_missing:
    'The private discussion member could not be found.',
  private_discussion_recipient_missing:
    'The private discussion has no recipient.',
  recipient_not_found: 'Recipient not found.',
  sender_required_to_delete_message:
    'Only the sender can delete this message.',
  sender_required_to_edit_message: 'Only the sender can edit this message.',
  session_disable_failed: 'The session could not be signed out.',
  session_not_found: 'Session not found.',
  something_went_wrong: 'Something went wrong',
  unauthorized: 'Your session has expired. Please sign in again.',
  user_not_found: 'User not found.',
  username_already_exists: 'This username is already taken.',
  users_not_found: 'One or more users could not be found.',
  verification_already_used:
    'This verification request has already been used.',
  verification_attempts_limit_reached:
    'Too many verification attempts. Please request a new code.',
  verification_code_resends_limit_reached:
    'The verification code resend limit has been reached.',
  verification_expired: 'The verification request has expired.',
  verification_not_completed: 'Verification has not been completed.',
  verification_not_found_or_expired:
    'The verification request was not found or has expired.',
} as const;

type ExceptionCode = keyof typeof englishExceptionTranslations;

const frenchExceptionTranslations = {
  blocked_relationship:
    'Vous ne pouvez pas interagir avec cet utilisateur, car l’un de vous a bloqué l’autre.',
  blocked_user_in_discussion:
    'Un utilisateur bloqué ne peut pas être ajouté à cette discussion.',
  blocked_user_in_group:
    'Un utilisateur bloqué ne peut pas être ajouté à ce groupe.',
  cannot_block_yourself: 'Vous ne pouvez pas vous bloquer vous-même.',
  cannot_delete_comment: 'Vous ne pouvez pas supprimer ce commentaire.',
  cannot_delete_post: 'Vous ne pouvez pas supprimer cette publication.',
  cannot_follow_blocked_user:
    'Vous ne pouvez pas suivre cet utilisateur, car l’un de vous a bloqué l’autre.',
  cannot_follow_yourself: 'Vous ne pouvez pas vous suivre vous-même.',
  collection_name_already_exists:
    'Une collection portant ce nom existe déjà.',
  collection_not_found: 'Collection introuvable.',
  comment_not_found: 'Commentaire introuvable.',
  current_password_incorrect: 'Le mot de passe actuel est incorrect.',
  deleted_message_edit_forbidden:
    'Un message supprimé ne peut pas être modifié.',
  discussion_blocked:
    'Vous ne pouvez pas envoyer de message dans cette discussion.',
  discussion_not_found: 'Discussion introuvable.',
  email_already_exists: 'Un compte utilise déjà cette adresse e-mail.',
  email_unchanged: 'La nouvelle adresse e-mail doit être différente.',
  group_manager_required:
    'Seul un responsable du groupe peut effectuer cette action.',
  group_member_not_found: 'Membre du groupe introuvable.',
  group_name_required: 'Le nom du groupe est requis.',
  group_operation_required:
    'Cette action est uniquement disponible pour les discussions de groupe.',
  group_owner_cannot_be_removed:
    'Le propriétaire du groupe ne peut pas être retiré.',
  group_owner_required_to_change_roles:
    'Seul le propriétaire du groupe peut modifier les rôles des membres.',
  incorrect_email_or_password: 'Adresse e-mail ou mot de passe incorrect.',
  insufficient_group_members:
    'Une discussion de groupe doit compter au moins trois membres.',
  invalid_private_discussion_members:
    'Une discussion privée doit contenir exactement deux membres.',
  invalid_verification_code: 'Le code de vérification est invalide.',
  invalid_verification_data: 'La demande de vérification est invalide.',
  member_cannot_leave_private_discussion:
    'Vous ne pouvez pas quitter une discussion privée.',
  member_role_missing: 'Veuillez sélectionner un rôle pour ce membre.',
  message_not_found: 'Message introuvable.',
  no_new_member: 'Aucun nouveau membre à ajouter.',
  own_blocked_state_only:
    'Vous pouvez uniquement modifier votre propre statut de blocage.',
  owner_cannot_change_own_role:
    'Le propriétaire du groupe ne peut pas modifier son propre rôle.',
  owner_required_to_remove_admin:
    'Seul le propriétaire du groupe peut retirer un administrateur.',
  owner_role_change_forbidden:
    'Le rôle du propriétaire du groupe ne peut pas être modifié.',
  parent_comment_not_found: 'Commentaire parent introuvable.',
  parent_message_not_found:
    'Message parent introuvable dans cette discussion.',
  post_not_found: 'Publication introuvable.',
  private_discussion_creation_failed:
    'La discussion privée n’a pas pu être créée.',
  private_discussion_details_forbidden:
    'Une discussion privée ne peut pas avoir les informations d’un groupe.',
  private_discussion_member_missing:
    'Le membre de la discussion privée est introuvable.',
  private_discussion_recipient_missing:
    'La discussion privée n’a aucun destinataire.',
  recipient_not_found: 'Destinataire introuvable.',
  sender_required_to_delete_message:
    'Seul l’expéditeur peut supprimer ce message.',
  sender_required_to_edit_message:
    'Seul l’expéditeur peut modifier ce message.',
  session_disable_failed: 'La session n’a pas pu être déconnectée.',
  session_not_found: 'Session introuvable.',
  something_went_wrong: 'Une erreur est survenue',
  unauthorized: 'Votre session a expiré. Veuillez vous reconnecter.',
  user_not_found: 'Utilisateur introuvable.',
  username_already_exists: 'Ce nom d’utilisateur est déjà utilisé.',
  users_not_found: 'Un ou plusieurs utilisateurs sont introuvables.',
  verification_already_used:
    'Cette demande de vérification a déjà été utilisée.',
  verification_attempts_limit_reached:
    'Trop de tentatives de vérification. Veuillez demander un nouveau code.',
  verification_code_resends_limit_reached:
    'La limite de renvoi du code de vérification a été atteinte.',
  verification_expired: 'La demande de vérification a expiré.',
  verification_not_completed: 'La vérification n’est pas terminée.',
  verification_not_found_or_expired:
    'La demande de vérification est introuvable ou a expiré.',
} as const satisfies Record<ExceptionCode, string>;

const exceptionTranslations = {
  en: englishExceptionTranslations,
  fr: frenchExceptionTranslations,
};

function getLanguage(): keyof typeof exceptionTranslations {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith('fr') ? 'fr' : 'en';
}

function translateExceptionCode(code: unknown): string {
  const translations = exceptionTranslations[getLanguage()];
  if (typeof code === 'string' && code in translations) {
    return translations[code as ExceptionCode];
  }

  return translations.something_went_wrong;
}

function getExceptionCode(data: unknown): unknown {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('error' in data) ||
    typeof data.error !== 'object' ||
    data.error === null ||
    !('code' in data.error)
  ) {
    return undefined;
  }

  return data.error.code;
}

function getExceptionMessage(error: unknown): string {
  if (!isHTTPError(error)) {
    return exceptionTranslations[getLanguage()].something_went_wrong;
  }

  return translateExceptionCode(getExceptionCode(error.data));
}

export { getExceptionMessage, translateExceptionCode };
