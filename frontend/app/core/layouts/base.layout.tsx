import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router";

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
});

const BaseLayout = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
		</QueryClientProvider>
	);
};

export default BaseLayout;
