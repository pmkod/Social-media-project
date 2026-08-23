import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { CreatePostForm } from "@/features/post/create-post/create-post-form.tsx";
import { Feed } from "@/features/post/feed/feed.tsx";

export const Route = createFileRoute("/_main/_with-right-aside/home")({
	component: HomePage,
});

function HomePage() {
	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle>Feed</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			<div className="space-y-5">
				<CreatePostForm />
				<Feed />
			</div>
		</MainContainer>
	);
}
