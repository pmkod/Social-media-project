import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { UserListModal } from "@/features/user/common/user-list-modal.tsx";
import { useListFollowers } from "./use-list-followers.ts";

type ListFollowersModalProps = {
	userId: string;
	username: string;
};

const ListFollowersModal = create(
	({ userId, username }: ListFollowersModalProps) => {
		const modal = useModal();
		const query = useListFollowers(userId);

		return (
			<UserListModal
				modal={modal}
				query={query}
				username={username}
				title="Followers"
				emptyTitle="Aucun follower"
			/>
		);
	},
);

export { ListFollowersModal };
