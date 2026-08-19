import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { UserListModal } from "@/features/user/common/user-list-modal.tsx";
import { useListFollowing } from "./use-list-following.ts";

type ListFollowingModalProps = {
	userId: string;
	username: string;
};

const ListFollowingModal = create(
	({ userId, username }: ListFollowingModalProps) => {
		const modal = useModal();
		const query = useListFollowing(userId);

		return (
			<UserListModal
				modal={modal}
				query={query}
				username={username}
				title="Following"
				emptyTitle="Aucun abonnement"
			/>
		);
	},
);

export { ListFollowingModal };
