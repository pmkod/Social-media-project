import {
	EmptyBlock,
	type EmptyBlockProps,
} from "@/core/components/ui/empty-block.tsx";
import { cn } from "@/core/lib/utils.ts";

function ExceptionBlock({ className, ...props }: EmptyBlockProps) {
	return (
		<EmptyBlock
			{...props}
			className={cn("border-destructive/40 bg-destructive/5", className)}
		/>
	);
}

export { ExceptionBlock };
export type { EmptyBlockProps as ExceptionBlockProps };
