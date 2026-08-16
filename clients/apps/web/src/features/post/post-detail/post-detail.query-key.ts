import { postsQueryKey } from "../posts.query-key";

const postDetailsRootQueryKey = [...postsQueryKey.root];

const postDetailsQueryKey = {
	root: postDetailsRootQueryKey,
	build: (postId: string) => [...postDetailsRootQueryKey, postId],
	buildComments: (postId: string) => [
		...postDetailsRootQueryKey,
		postId,
		"comments",
	],
};

export { postDetailsQueryKey };
