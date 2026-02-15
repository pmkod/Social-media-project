import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { GetPostsFilters } from "./types/get-posts-filters";

const postQueryKeys = createQueryKeys("post", {
	getPosts: (filters?: GetPostsFilters) => {
		return [filters];
	},
});

export { postQueryKeys };
