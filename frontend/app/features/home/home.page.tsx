import type { Route } from "../../+types/root";
import { CreatePostForm } from "../post/components/create-post.form";
import { Feed } from "../post/components/feed";
export function meta(params: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div className="flex-1 pt-12 pb-7 fle">
			<div className="mb-7">
				<CreatePostForm />
			</div>
			<Feed />
		</div>
	);
}
