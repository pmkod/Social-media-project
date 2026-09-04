import { RiLoader4Line } from "@remixicon/react";

export function ChillzLoader() {
	return (
		<div
			role="status"
			className="flex h-full min-h-64 flex-1 items-center justify-center"
		>
			<RiLoader4Line
				className="size-9 animate-spin text-primary"
				aria-hidden="true"
			/>
			<span className="sr-only">Loading Chillz</span>
		</div>
	);
}
