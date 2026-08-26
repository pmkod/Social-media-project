import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { Comment } from "../common/comment.ts";

const commentToReplyToAtom = atom<Comment | null>(null);

function useCommentToReplyTo() {
	const [commentToReplyTo, setCommentToReplyTo] = useAtom(commentToReplyToAtom);

	const clearCommentToReplyTo = useCallback(() => {
		setCommentToReplyTo(null);
	}, [setCommentToReplyTo]);

	return {
		commentToReplyTo,
		setCommentToReplyTo,
		clearCommentToReplyTo,
	};
}

export { useCommentToReplyTo };
