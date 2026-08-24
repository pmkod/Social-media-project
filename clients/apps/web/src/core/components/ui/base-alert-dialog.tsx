import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog.tsx";
import { useModal } from "./nice-modal.tsx";

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
	const [isConfirming, setIsConfirming] = useState(false);

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

export type { BaseAlertDialogProps };
export { BaseAlertDialog };
