import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sonner";

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
});

const BaseLayout = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
			<Toaster />
		</QueryClientProvider>
	);
};

export default BaseLayout;
