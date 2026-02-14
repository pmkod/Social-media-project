const routesBuilder = {
	first: "/",
	login: "/login",
	signup: "/signup",
	passwordReset: "/password-reset",
	newPassword: "/new-password",
	userVerification: (params?: { goal: string }) => {
		const searchParams = new URLSearchParams();
		if (params?.goal) {
			searchParams.set("goal", params.goal);
		}
		const searchParamsString = searchParams.toString();
		return (
			"/user-verification" +
			(searchParamsString ? `?${searchParamsString}` : "")
		);
	},

	home: "/home",
	discussions: "/discussions",
	explore: "/explore",
	userProfile: (userName: string) => `/users/${userName}`,
};

export { routesBuilder };
