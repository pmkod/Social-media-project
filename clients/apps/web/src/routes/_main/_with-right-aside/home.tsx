import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { CreatePostForm } from "@/features/post/create-post/create-post-form.tsx";
import { Feed } from "@/features/post/feed/feed.tsx";
import { StoriesTray } from "@/features/story/stories-tray.tsx";

export const Route = createFileRoute("/_main/_with-right-aside/home")({
	component: HomePage,
});

function HomePage() {
	return (
		<MainContainer>
			<div className="space-y-5 pt-7">
				<StoriesTray />
				<CreatePostForm />
				<Feed />
			</div>
		</MainContainer>
	);
}
