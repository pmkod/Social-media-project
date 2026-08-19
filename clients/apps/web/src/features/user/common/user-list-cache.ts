import type { User } from "./user.ts";

type UserListPage = {
	users: User[];
};

type UserListCache =
	| UserListPage
	| {
			pages: UserListPage[];
			pageParams: unknown[];
	  };

const updateUserListCache = (
	data: UserListCache | undefined,
	updateUser: (user: User) => User,
) => {
	if (!data) return data;

	if ("users" in data) {
		return {
			...data,
			users: data.users.map(updateUser),
		};
	}

	return {
		...data,
		pages: data.pages.map((page) => ({
			...page,
			users: page.users.map(updateUser),
		})),
	};
};

export { updateUserListCache };
export type { UserListCache };
