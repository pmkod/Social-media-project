import { IconLogout } from "@tabler/icons-react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/core/components/partials/bottom-nav";
import { Logo } from "@/core/components/partials/logo";
import { Sidebar } from "@/core/components/partials/sidebar";

export const Route = createFileRoute("/_main")({
	component: MainLayoutComponent,
});

function MainLayoutComponent() {
	return (
		<div className="">
			<div className="min-h-screen w-full flex justify-between">
				{/* Desktop & Tablet Sidebar */}
				<Sidebar />

				{/* Mobile Header */}
				{/* <header className="md:hidden flex items-center justify-between p-3 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
					<Logo />
					<Link
						to="/"
						className="text-slate-500 hover:text-rose-500 p-2 rounded-full"
						title="Se déconnecter"
					>
						<IconLogout className="h-5 w-5" />
					</Link>
				</header> */}

				{/* Main Content Area */}
				<main className="flex-1 min-w-0 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen">
					<Outlet />
				</main>

				{/* Right Sidebar (Desktop Recommendations / Widgets) */}
				<aside className="hidden lg:block w-80 p-4 space-y-4 h-screen sticky top-0 overflow-y-auto">
					{/* Search Box */}
					<div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
						<h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
							À suivre absolument
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5 min-w-0">
									<img
										src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
										alt="Sophie"
										className="h-8 w-8 rounded-full object-cover"
									/>
									<div className="min-w-0 text-xs">
										<div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
											Sophie Martin
										</div>
										<div className="text-[10px] text-slate-500 truncate">
											@sophiem
										</div>
									</div>
								</div>
								<button
									type="button"
									className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-[11px] font-medium transition-colors"
								>
									Suivre
								</button>
							</div>
						</div>
					</div>
				</aside>

				{/* Mobile Navigation Bar */}
				<BottomNav />
			</div>
		</div>
	);
}
