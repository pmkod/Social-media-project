import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/core/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut } from "lucide-react";

type NavUserProps = {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
};

export function LoggedInUserDropdownMenu({ user }: NavUserProps) {
	//   const { isMobile } = useSidebar()
	//   const [open, setOpen] = useDialogState()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="w-full flex items-center justify-between hover:bg-gray-100 px-3 py-2 rounded cursor-pointer transition-colors"
				>
					<Avatar className="size-12 rounded-lg mr-2">
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className="rounded-lg">SN</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-start leading-tight">
						<span className="truncate text-base font-semibold">
							{user.name}
						</span>
						<span className="truncate text-sm">{user.email}</span>
					</div>
					<ChevronsUpDown className="ms-auto size-4 ml-1" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				// className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				//   side={isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuItem
					variant="destructive"
					// onClick={() => setOpen(true)}
				>
					<LogOut />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
