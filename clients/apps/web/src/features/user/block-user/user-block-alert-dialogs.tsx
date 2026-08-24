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
} from "@/core/components/ui/alert-dialog.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";

type UserBlockAlertDialogContentProps = {
	title: string;
	description: string;
	confirmText: string;
	confirmColorScheme?: "primary" | "destructive";
	onConfirm: () => void | Promise<void>;
};

const UserBlockAlertDialogContent = ({
	title,
	description,
	confirmText,
	confirmColorScheme,
	onConfirm,
}: UserBlockAlertDialogContentProps) => {
	const modal = useModal();
	const [isConfirming, setIsConfirming] = useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			if (onConfirm instanceof Promise) {
				await onConfirm();
			} else {
				onConfirm();
			}
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

type UserBlockAlertDialogProps = {
	username: string;
	onConfirm: () => void | Promise<void>;
};

const BlockUserAlertDialog = create<UserBlockAlertDialogProps>(
	({ username, onConfirm }) => (
		<UserBlockAlertDialogContent
			title={`Block @${username}?`}
			description="You will no longer see each other's content. If either of you follows the other, those follows will be removed."
			confirmText="Block"
			confirmColorScheme="destructive"
			onConfirm={onConfirm}
		/>
	),
);

const UnblockUserAlertDialog = create<UserBlockAlertDialogProps>(
	({ username, onConfirm }) => (
		<UserBlockAlertDialogContent
			title={`Unblock @${username}?`}
			description="They will be able to view and interact with your content again. Previous follows will not be restored."
			confirmText="Unblock"
			onConfirm={onConfirm}
		/>
	),
);

export { BlockUserAlertDialog, UnblockUserAlertDialog };
