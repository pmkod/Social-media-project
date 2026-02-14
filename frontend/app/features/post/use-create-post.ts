import { httpClient } from "@/core/services/http.client";
import { useMutation } from "@tanstack/react-query";

type CreatePostRequestBody = {
	content: string;
};

const useCreatePost = () => {
	return useMutation({
		mutationFn: ({ content }: CreatePostRequestBody) => {
			const formData = new FormData();
			formData.set("content", content);
			return httpClient
				.post("posts", {
					body: formData,
				})
				.json();
		},
	});
};

export { useCreatePost };
