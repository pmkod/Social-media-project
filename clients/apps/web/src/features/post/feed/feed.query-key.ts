import {
	postListQueryKeys,
	postListRootQueryKey,
} from "../common/post-list.query-keys.ts";

const feedQueryKey = {
	root: postListRootQueryKey,
	build: () => postListQueryKeys.feed(),
	buildFollowing: () => postListQueryKeys.feedFollowing(),
};

export { feedQueryKey };
