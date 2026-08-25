import { RiArrowRightSLine, RiCheckLine } from "@remixicon/react";
import { cn } from "@/core/lib/utils.ts";
import type { ReportReason } from "./report-reason.ts";

type ReportReasonItemProps = {
	reason: Pick<ReportReason, "id" | "name" | "description">;
	isSelected: boolean;
	disabled?: boolean;
	onSelect: (reasonId: string) => void;
};

function ReportReasonItem({
	reason,
	isSelected,
	disabled = false,
	onSelect,
}: ReportReasonItemProps) {
	return (
		<label
			className={cn(
				"flex w-full cursor-pointer items-center gap-3 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/60",
				isSelected && "bg-muted/70",
				disabled && "cursor-not-allowed opacity-60",
			)}
		>
			<input
				type="radio"
				name="report-reason"
				value={reason.id}
				checked={isSelected}
				disabled={disabled}
				onChange={() => onSelect(reason.id)}
				className="sr-only"
			/>
			<span className="min-w-0 flex-1">
				<span className="block text-[15px] font-semibold text-foreground">
					{reason.name}
				</span>
				{reason.description ? (
					<span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
						{reason.description}
					</span>
				) : null}
			</span>
			{isSelected ? (
				<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<RiCheckLine className="size-4" />
				</span>
			) : (
				<RiArrowRightSLine className="size-5 shrink-0 text-muted-foreground" />
			)}
		</label>
	);
}

export { ReportReasonItem };
