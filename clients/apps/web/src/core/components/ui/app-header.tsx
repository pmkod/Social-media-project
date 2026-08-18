import { RiArrowLeftLine } from "@remixicon/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type * as React from "react";
import { cn } from "@/core/lib/utils.ts";

function AppHeader({
	className,
	sticky = true,
	bordered = false,
	...props
}: React.ComponentProps<"header"> & {
	sticky?: boolean;
	bordered?: boolean;
}) {
	return (
		<header
			data-slot="app-header"
			className={cn(
				"z-20 flex h-14 items-center justify-between gap-4 px-4 bg-background/80 backdrop-blur-md",
				sticky && "sticky top-0",
				bordered && "border-b border-border",
				className,
			)}
			{...props}
		/>
	);
}

function AppHeaderLeftPart({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="app-header-left-part"
			className={cn("flex items-center gap-3 min-w-0 flex-1", className)}
			{...props}
		/>
	);
}

function AppHeaderRightPart({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="app-header-right-part"
			className={cn("flex items-center gap-2 shrink-0", className)}
			{...props}
		/>
	);
}

type AppHeaderGoBackButtonProps = {
	to?: LinkProps["to"] | string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	"aria-label"?: string;
	onClick?: (
		event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
	) => void;
} & Omit<React.ComponentProps<"button">, "onClick" | "children">;

function AppHeaderGoBackButton({
	to,
	icon,
	children,
	className,
	"aria-label": ariaLabel = "Retour",
	onClick,
	...props
}: AppHeaderGoBackButtonProps) {
	const buttonContent = children ?? icon ?? (
		<RiArrowLeftLine className="size-5" />
	);
	const baseClassName = cn(
		"inline-flex size-9 shrink-0 items-center justify-center -ml-3 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
		className,
	);

	if (to) {
		return (
			<Link
				to={to as string}
				aria-label={ariaLabel}
				className={baseClassName}
				onClick={onClick}
				data-slot="app-header-go-back-button"
			>
				{buttonContent}
			</Link>
		);
	}

	return (
		<button
			type="button"
			aria-label={ariaLabel}
			className={baseClassName}
			onClick={(event) => {
				if (onClick) {
					onClick(event);
				} else if (typeof window !== "undefined") {
					window.history.back();
				}
			}}
			data-slot="app-header-go-back-button"
			{...props}
		>
			{buttonContent}
		</button>
	);
}

function AppHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
	return (
		<h1
			data-slot="app-header-title"
			className={cn(
				"text-lg font-bold tracking-tight text-foreground leading-tight truncate",
				className,
			)}
			{...props}
		/>
	);
}

function AppHeaderSubtitle({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="app-header-subtitle"
			className={cn("text-xs text-muted-foreground truncate", className)}
			{...props}
		/>
	);
}

export {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderRightPart,
	AppHeaderGoBackButton,
	AppHeaderTitle,
	AppHeaderSubtitle,
};
