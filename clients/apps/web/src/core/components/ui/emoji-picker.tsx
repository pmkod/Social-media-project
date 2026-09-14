import { RiLoader4Line, RiSearchLine } from "@remixicon/react";
import {
	type EmojiPickerListCategoryHeaderProps,
	type EmojiPickerListEmojiProps,
	type EmojiPickerListRowProps,
	EmojiPicker as EmojiPickerPrimitive,
} from "frimousse";
import type * as React from "react";
import { useState } from "react";

import { cn } from "@/core/lib/utils.ts";
import * as m from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

type EmojiPickerPopoverProps = {
	children: React.ReactElement;
	onEmojiSelect: (emoji: string) => void;
	align?: React.ComponentProps<typeof PopoverContent>["align"];
	side?: React.ComponentProps<typeof PopoverContent>["side"];
};

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
	return (
		<div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
			{children}
		</div>
	);
}

function EmojiPickerEmoji({
	emoji,
	className,
	...props
}: EmojiPickerListEmojiProps) {
	return (
		<button
			type="button"
			{...props}
			className={cn(
				"flex size-8 cursor-pointer items-center justify-center rounded-md text-lg outline-none hover:bg-accent data-[active]:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50",
				className,
			)}
			data-slot="emoji-picker-emoji"
		>
			{emoji.emoji}
		</button>
	);
}

function EmojiPickerCategoryHeader({
	category,
	...props
}: EmojiPickerListCategoryHeaderProps) {
	return (
		<div
			{...props}
			className="bg-popover px-3 pt-3 pb-2 text-xs font-medium leading-none text-muted-foreground"
			data-slot="emoji-picker-category-header"
		>
			{category.label}
		</div>
	);
}

function EmojiPickerPopover({
	children,
	onEmojiSelect,
	align = "start",
	side = "bottom",
}: EmojiPickerPopoverProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				align={align}
				side={side}
				sideOffset={8}
				collisionPadding={12}
				className="w-auto overflow-hidden p-0"
			>
				<EmojiPickerPrimitive.Root
					locale={getLocale()}
					columns={9}
					onEmojiSelect={({ emoji }) => {
						onEmojiSelect(emoji);
						setOpen(false);
					}}
					className="isolate flex h-80 w-[min(20rem,calc(100vw-2rem))] flex-col bg-popover text-popover-foreground"
				>
					<div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
						<RiSearchLine className="size-4 shrink-0 text-muted-foreground" />
						<EmojiPickerPrimitive.Search
							placeholder={m.emoji_picker_search()}
							aria-label={m.emoji_picker_search()}
							className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>
					<EmojiPickerPrimitive.Viewport className="relative min-h-0 flex-1 outline-none">
						<EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<RiLoader4Line className="size-4 animate-spin" />
							{m.emoji_picker_loading()}
						</EmojiPickerPrimitive.Loading>
						<EmojiPickerPrimitive.Empty className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
							{m.emoji_picker_empty()}
						</EmojiPickerPrimitive.Empty>
						<EmojiPickerPrimitive.List
							className="select-none pb-1"
							components={{
								Row: EmojiPickerRow,
								Emoji: EmojiPickerEmoji,
								CategoryHeader: EmojiPickerCategoryHeader,
							}}
						/>
					</EmojiPickerPrimitive.Viewport>
				</EmojiPickerPrimitive.Root>
			</PopoverContent>
		</Popover>
	);
}

export { EmojiPickerPopover };
