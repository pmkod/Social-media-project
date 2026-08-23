import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { Input, type InputProps } from "@/core/components/ui/input.tsx";
import { cn } from "@/core/lib/utils.ts";

type PasswordInputProps = Omit<InputProps, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<div className="relative">
			<Input
				type={showPassword ? "text" : "password"}
				className={cn("pr-10", className)}
				{...props}
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				onClick={() => setShowPassword((prev) => !prev)}
				tabIndex={-1}
				aria-label={showPassword ? "Hide password" : "Show password"}
			>
				{showPassword ? (
					<EyeOff className="size-4" />
				) : (
					<Eye className="size-4" />
				)}
			</Button>
		</div>
	);
}

export { PasswordInput };
