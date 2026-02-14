import type { Route } from "../../+types/root";
import { Feed } from "../post/components/feed";
export function meta(params: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div className="flex-1 pt-7">
			<Feed />
		</div>
	);
}
