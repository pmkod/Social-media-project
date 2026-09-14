import { RiLoader4Line } from "@remixicon/react";

import * as m from "@/paraglide/messages.js";

function FullPageLoader() {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-background"
			role="status"
			aria-label={m.action_loading()}
		>
			<RiLoader4Line
				className="size-7 animate-spin text-muted-foreground"
				aria-hidden="true"
			/>
		</div>
	);
}

export { FullPageLoader };
