import routes from "../services.json";

type RouteDefinition = {
	path: string;
	target: string;
};

const routeDefinitions = routes as RouteDefinition[];

const isInternalPath = (pathname: string) => {
	let decodedPathname = pathname;

	try {
		decodedPathname = decodeURIComponent(pathname);
	} catch {
		// Keep the original path when it contains malformed percent-encoding.
	}

	return decodedPathname.startsWith("/internal");
};

const findRoute = (pathname: string) => {
	return routeDefinitions.find((route) => pathname.startsWith(route.path));
};

export { findRoute, isInternalPath };
