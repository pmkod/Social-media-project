import type { User } from "../../common/user.ts";

type UseLoggedInUserQueryData = {
	id: User["id"];
	firstName: User["firstName"];
	lastName: User["lastName"];
};

export type { UseLoggedInUserQueryData };
