import { RiSearchLine } from "@remixicon/react";
import { cva, type VariantProps } from "class-variance-authority";
import { useId } from "react";

import { Input, type InputProps } from "@/core/components/ui/input.tsx";
import { cn } from "@/core/lib/utils.ts";

const searchInputVariants = cva("rounded-full bg-muted/60 shadow-none", {
	variants: {
		size: {
			default: "pl-9",
			lg: "pl-10",
			xl: "pl-12",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

const searchIconVariants = cva(
	"pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
	{
		variants: {
			size: {
				default: "left-3 size-4",
				lg: "left-3 size-4",
				xl: "left-4 size-5",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type SearchInputProps = Omit<InputProps, "size" | "type"> &
	VariantProps<typeof searchInputVariants> & {
		label?: string;
	};

function SearchInput({
	className,
	label = "Search",
	size = "default",
	id,
	...props
}: SearchInputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	return (
		<label
			htmlFor={inputId}
			data-slot="search-input"
			data-size={size}
			className="block"
		>
			<span className="sr-only">{label}</span>
			<span className="relative block">
				<RiSearchLine
					aria-hidden="true"
					className={searchIconVariants({ size })}
				/>
				<Input
					{...props}
					id={inputId}
					type="search"
					size={size}
					className={cn(searchInputVariants({ size }), className)}
				/>
			</span>
		</label>
	);
}

export { SearchInput, type SearchInputProps };
