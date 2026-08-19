import { type ReactNode, useCallback, useState } from "react";
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
import NiceModal, {
	create,
	useModal,
} from "@/core/components/ui/nice-modal.tsx";

type BaseAlertDialogProps = {
	title: ReactNode;
	description: ReactNode;
	cancel?: { text?: string };
	confirm?: {
		text?: string;
		colorScheme?: "primary" | "destructive";
		handler?: () => void | Promise<void>;
	};
};

const BaseAlertDialog = create(
	({ title, description, cancel, confirm }: BaseAlertDialogProps) => {
		const modal = useModal();
		const [isConfirming, setIsConfirming] = useState(false);

		const handleConfirm = async () => {
			if (!confirm?.handler) {
				modal.remove();
				return;
			}
			setIsConfirming(true);
			try {
				await confirm.handler();
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
						{cancel ? (
							<AlertDialogCancel disabled={isConfirming}>
								{cancel.text ?? "Cancel"}
							</AlertDialogCancel>
						) : null}
						{confirm ? (
							<AlertDialogAction
								colorScheme={confirm.colorScheme}
								disabled={isConfirming}
								onClick={(event) => {
									event.preventDefault();
									void handleConfirm();
								}}
							>
								{isConfirming ? "Please wait…" : (confirm.text ?? "Confirm")}
							</AlertDialogAction>
						) : null}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	},
);

function useAlertDialog() {
	const show = useCallback(
		(props: BaseAlertDialogProps) => NiceModal.show(BaseAlertDialog, props),
		[],
	);
	return { show };
}

export { BaseAlertDialog, useAlertDialog };
export type { BaseAlertDialogProps };
