import { Avatar } from "@/core/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useLoggedInUser } from "../use-logged-in-user";

const LoggedInUserDropdownMenu = () => {
	const { data, isLoading, isSuccess } = useLoggedInUser();

	return isLoading ? (
		<div></div>
	) : isSuccess ? (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="w-full flex items-center justify-between hover:bg-gray-100 px-3 py-2 rounded cursor-pointer transition-colors"
				>
					<div className="mr-3">
						<Avatar size="lg" />
					</div>
					<div className="grid flex-1 text-start leading-tight">
						<span className="truncate text-base font-semibold">
							{data.user.fullName}
						</span>
						<span className="truncate text-sm">@{data.user.username}</span>
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
	) : null;
};

export { LoggedInUserDropdownMenu };
