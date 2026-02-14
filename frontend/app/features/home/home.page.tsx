import type { Route } from "../../+types/root";
export function meta(params: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div>
			<div className="p-8">
				<div className="grid grid-cols-5 gap-4"></div>
			</div>
		</div>
	);
}
