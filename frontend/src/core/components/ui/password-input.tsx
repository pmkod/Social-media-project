import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/core/lib/utils.ts";
import { Input, type InputProps } from "@/core/components/ui/input.tsx";
import { Button } from "@/core/components/ui/button.tsx";

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
				aria-label={
					showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
				}
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

export { PasswordInput, type PasswordInputProps };
