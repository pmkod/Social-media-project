import { RiLoader4Line } from "@remixicon/react";

import { Logo } from "@/core/components/partials/logo.tsx";
import * as m from "@/paraglide/messages.js";

function FullPageLoader() {
	return (
		<div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background"
			role="status"
			aria-label={m.action_loading()}
		>
			<Logo />
			<RiLoader4Line
				className="size-7 animate-spin text-muted-foreground"
				aria-hidden="true"
			/>
		</div>
	);
}

export { FullPageLoader };
