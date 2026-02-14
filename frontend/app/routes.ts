import {
	index,
	layout,
	route,
	type RouteConfig,
} from "@react-router/dev/routes";

export default [
	layout("./core/layouts/base.layout.tsx", [
		layout("./core/layouts/presentation.layout.tsx", [
			layout("./features/authentication/layouts/authentication.layout.tsx", [
				index("./features/authentication/pages/login.page.tsx"),
				route("signup", "./features/authentication/pages/signup.page.tsx"),
				route(
					"password-reset",
					"./features/authentication/pages/password-reset.page.tsx",
				),
				route(
					"new-password",
					"./features/authentication/pages/new-password.page.tsx",
				),
				route(
					"user-verification",
					"./features/authentication/pages/user-verification.page.tsx",
				),
			]),
			index("features/home/home.page.tsx"),
		]),
	]),
] satisfies RouteConfig;
