import type { User } from "@/features/user/types/user";

type GetPostsFilters = {
	userId?: User["id"];
	size?: number;
	page?: number;
};

export type { GetPostsFilters };
