import { AUTHORIZATION_FIELDS_KEYS } from "../constants/authorization.constants";

//
//
//
//
//

const getAccessToken = () => {
  return localStorage.getItem(AUTHORIZATION_FIELDS_KEYS.accessToken);
};

//
//
//
//
//

const saveAccessToken = (accessToken: string) => {
  localStorage.setItem(AUTHORIZATION_FIELDS_KEYS.accessToken, accessToken);
};

//
//
//
//
//

const getRefreshToken = () => {
  return localStorage.getItem(AUTHORIZATION_FIELDS_KEYS.refreshToken);
};

//
//
//
//
//

const saveRefreshToken = (refreshToken: string) => {
  localStorage.setItem(AUTHORIZATION_FIELDS_KEYS.refreshToken, refreshToken);
};

//
//
//
//
//

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

//
//
//
//
//

const deleteAccessAndRefreshToken = () => {
  localStorage.removeItem(AUTHORIZATION_FIELDS_KEYS.accessToken);
  localStorage.removeItem(AUTHORIZATION_FIELDS_KEYS.refreshToken);
};

export {
  getAccessToken,
  saveAccessToken,
  getRefreshToken,
  saveRefreshToken,
  saveAccessAndRefreshToken,
  deleteAccessAndRefreshToken,
};
