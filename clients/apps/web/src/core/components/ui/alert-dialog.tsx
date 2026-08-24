import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/core/lib/utils.ts";
import { Button } from "./button.tsx";
import { useModal } from "./nice-modal.tsx";

function AlertDialog(
	props: React.ComponentProps<typeof AlertDialogPrimitive.Root>,
) {
	return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogPortal(
	props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>,
) {
	return (
		<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
	);
}

function AlertDialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
	return (
		<AlertDialogPrimitive.Overlay
			data-slot="alert-dialog-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogContent({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				data-slot="alert-dialog-content"
				className={cn(
					"fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-border bg-background p-5 shadow-2xl outline-none sm:max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	);
}

function AlertDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("space-y-2", className)}
			data-slot="alert-dialog-header"
			{...props}
		/>
	);
}

function AlertDialogFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			data-slot="alert-dialog-footer"
			{...props}
		/>
	);
}

function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			className={cn("text-lg font-bold text-foreground", className)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			className={cn("text-sm leading-relaxed text-muted-foreground", className)}
			{...props}
		/>
	);
}

function AlertDialogCancel(
	props: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>,
) {
	return (
		<AlertDialogPrimitive.Cancel asChild>
			<Button type="button" variant="outline" {...props} />
		</AlertDialogPrimitive.Cancel>
	);
}

function AlertDialogAction({
	colorScheme = "primary",
	...props
}: React.ComponentProps<typeof Button>) {
	return <Button type="button" colorScheme={colorScheme} {...props} />;
}

type BaseAlertDialogProps = {
	title: string;
	description: string;
	confirmText: string;
	confirmColorScheme?: "primary" | "destructive";
	onConfirm: () => void | Promise<void>;
};

const BaseAlertDialog = ({
	title,
	description,
	confirmText,
	confirmColorScheme,
	onConfirm,
}: BaseAlertDialogProps) => {
	const modal = useModal();
	const [isConfirming, setIsConfirming] = React.useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			await onConfirm();
			modal.remove();
		} catch {
			// The mutation retains the error and the dialog stays open for a retry.
		} finally {
			setIsConfirming(false);
		}
	};

	return (
		<AlertDialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open && !isConfirming) modal.remove();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						colorScheme={confirmColorScheme}
						disabled={isConfirming}
						onClick={(event) => {
							event.preventDefault();
							void handleConfirm();
						}}
					>
						{isConfirming ? "Please wait…" : confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	BaseAlertDialog,
};
