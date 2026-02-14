"use client";
import { useState } from "react";
import { Link } from "react-router";
// import { useLogout } from "@/features/authentication/mutations/use-logout";
// import { useLoggedInUser } from "@/features/user/use-logged-in-user";
import { Logo } from "../logo";

const Header = () => {
	const [open, setOpen] = useState(false);
	// const { data } = useLoggedInUser();
	// const { mutate: logout, isPending: isLogoutPending } = useLogout();
	// const handleLogout = () => {
	// 	logout();
	// };
	return (
		<header className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
			<Link to="/">
				<Logo />
			</Link>

			{/* Desktop Menu */}
			<div className="hidden sm:flex items-center gap-8">
				<Link to="/">Home</Link>
				<Link to="/">About</Link>
				<Link to="/">Contact</Link>
				<Link to="/seller/signup">Sell</Link>

				<div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
					<input
						className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
						type="text"
						placeholder="Search products"
					/>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M10.836 10.615 15 14.695"
							stroke="#7A7B7D"
							stroke-width="1.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							clip-rule="evenodd"
							d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
							stroke="#7A7B7D"
							stroke-width="1.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>

				{/* {data ? (
					<div className="flex items-center gap-4 px-3 py-1 rounded-full border">
						<div>{`${data.user.firstName} ${data.user.lastName}`}</div>
						<Button
							variant="ghost"
							onClick={handleLogout}
							isLoading={isLogoutPending}
						>
							<LogOut />
							Logout
						</Button>
					</div>
				) : (
					<Button
						type="button"
						render={<Link to="/login">Login</Link>}
						// className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
					></Button>
				)} */}
			</div>

			<button
				type="button"
				onClick={() => (open ? setOpen(false) : setOpen(true))}
				aria-label="Menu"
				className="sm:hidden"
			>
				{/* Menu Icon SVG */}
				<svg
					width="21"
					height="15"
					viewBox="0 0 21 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="21" height="1.5" rx=".75" fill="#426287" />
					<rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
					<rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
				</svg>
			</button>

			{/* Mobile Menu */}
			<div
				className={`${open ? "flex" : "hidden"} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}
			>
				<Link to="/" className="block">
					Home
				</Link>
				<Link to="/" className="block">
					About
				</Link>
				<Link to="/" className="block">
					Contact
				</Link>
				<Link to="/seller/signup" className="block">
					Sell
				</Link>
				{/* {data ? null : (
					<Button
						type="button"
						// className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm"
					>
						<Link to="/login">Login</Link>
					</Button>
				)} */}
			</div>
		</header>
	);
};

export { Header };
