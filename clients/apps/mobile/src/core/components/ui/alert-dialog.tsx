import React, { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	Text,
	View,
} from "react-native";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";

type AlertDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
};

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
	return (
		<Modal
			transparent
			animationType="fade"
			visible={open}
			onRequestClose={() => onOpenChange?.(false)}
		>
			<View className="flex-1 items-center justify-center bg-black/70 px-6">
				{children}
			</View>
		</Modal>
	);
}

function AlertDialogContent({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<View
			className={cn(
				"w-full max-w-sm rounded-2xl border border-[#27272a] bg-[#18181b] p-6 shadow-2xl",
				className,
			)}
		>
			{children}
		</View>
	);
}

function AlertDialogHeader({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return <View className={cn("gap-2", className)}>{children}</View>;
}

function AlertDialogTitle({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Text className={cn("text-lg font-bold text-foreground", className)}>
			{children}
		</Text>
	);
}

function AlertDialogDescription({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Text className={cn("text-sm text-muted-foreground", className)}>
			{children}
		</Text>
	);
}

function AlertDialogFooter({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<View className={cn("mt-6 flex-row justify-end gap-3", className)}>
			{children}
		</View>
	);
}

type BaseAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText: string;
	confirmColorScheme?: "primary" | "destructive";
	onConfirm: () => void | Promise<void>;
};

function BaseAlertDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText,
	confirmColorScheme = "primary",
	onConfirm,
}: BaseAlertDialogProps) {
	const [isConfirming, setIsConfirming] = useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			// keep dialog open on error
		} finally {
			setIsConfirming(false);
		}
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (!isConfirming) onOpenChange(next);
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						variant="outline"
						size="sm"
						disabled={isConfirming}
						onPress={() => onOpenChange(false)}
					>
						<Text className="text-foreground font-medium">Cancel</Text>
					</Button>
					<Button
						variant={confirmColorScheme === "destructive" ? "destructive" : "default"}
						size="sm"
						disabled={isConfirming}
						onPress={handleConfirm}
					>
						{isConfirming ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="font-medium text-white">{confirmText}</Text>
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	BaseAlertDialog,
};
export type { BaseAlertDialogProps };
