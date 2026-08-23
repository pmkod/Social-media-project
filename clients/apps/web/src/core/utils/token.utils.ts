import { AuthorizationTokenKeys } from "@/core/constants/authorization.constants.ts";

const getAccessToken = () => {
	return localStorage.getItem(AuthorizationTokenKeys.accessToken);
};

const saveAccessToken = (accessToken: string) => {
	localStorage.setItem(AuthorizationTokenKeys.accessToken, accessToken);
};

const getRefreshToken = () => {
	return localStorage.getItem(AuthorizationTokenKeys.refreshToken);
};

const saveRefreshToken = (refreshToken: string) => {
	localStorage.setItem(AuthorizationTokenKeys.refreshToken, refreshToken);
};

type SaveAccessAndRefreshTokenParams = {
	accessToken: string;
	refreshToken: string;
};

const saveAccessAndRefreshToken = ({
	accessToken,
	refreshToken,
}: SaveAccessAndRefreshTokenParams) => {
	saveAccessToken(accessToken);
	saveRefreshToken(refreshToken);
};

const deleteAccessToken = () => {
	localStorage.removeItem(AuthorizationTokenKeys.accessToken);
};

const deleteRefreshToken = () => {
	localStorage.removeItem(AuthorizationTokenKeys.refreshToken);
};

const deleteAccessAndRefreshToken = () => {
	deleteAccessToken();
	deleteRefreshToken();
};

export {
	getAccessToken,
	saveAccessToken,
	getRefreshToken,
	saveAccessAndRefreshToken,
	deleteAccessAndRefreshToken,
};
