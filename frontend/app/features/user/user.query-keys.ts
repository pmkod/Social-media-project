import { createQueryKeys } from "@lukemorales/query-key-factory";

const userQueryKeys = createQueryKeys("user", {
	loggedInUser: null,
	getUser: (username: string) => [username],
});

export { userQueryKeys };
