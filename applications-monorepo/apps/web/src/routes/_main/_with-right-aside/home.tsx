import { createFileRoute } from "@tanstack/react-router";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { CreatePostForm } from "@/features/post/create-post/create-post-form.tsx";
import { Feed } from "@/features/post/feed/feed.tsx";

export const Route = createFileRoute("/_main/_with-right-aside/home")({
	component: HomePage,
});

function HomePage() {
	return (
		<MainContainer>
			<div className="space-y-5 pt-7">
				<CreatePostForm />
				<Feed />
			</div>
		</MainContainer>
	);
}
