import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/features/post/feed/feed";
import { CreatePostForm } from "@/features/post/create-post/create-post-form";

export const Route = createFileRoute("/_main/home")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="mx-auto max-w-2xl">
			<div className="mt-5">
				<CreatePostForm />
			</div>

			<div className="mt-10">
				<Feed />
			</div>
		</div>
	);
}
