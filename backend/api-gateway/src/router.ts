import routes from "../services.json";

type RouteDefinition = {
	path: string;
	target: string;
};

const routeDefinitions = routes as RouteDefinition[];

const findRoute = (pathname: string) => {
	return routeDefinitions.find((route) => pathname.startsWith(route.path));
};

export { findRoute };
