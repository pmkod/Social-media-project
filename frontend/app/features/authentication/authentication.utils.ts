import { USER_VERIFICATION_FIELDS_KEYS } from "./authentication.constants";

const getUserVerificationDataFromLocalStorage = () => {
  const userVerificationId = localStorage.getItem(
    USER_VERIFICATION_FIELDS_KEYS.id,
  );
  const userVerificationToken = localStorage.getItem(
    USER_VERIFICATION_FIELDS_KEYS.token,
  );
  if (
    userVerificationId === null ||
    userVerificationToken === null ||
    userVerificationId === "" ||
    userVerificationToken === ""
  ) {
    throw Error();
  }

  return {
    userVerification: {
      id: userVerificationId,
      token: userVerificationToken,
    },
  };
};

type SaveUserVerificationDataToLocalStorageParams = {
  id: string;
  token: string;
};

const saveUserVerificationDataToLocalStorage = ({
  id,
  token,
}: SaveUserVerificationDataToLocalStorageParams) => {
  localStorage.setItem(USER_VERIFICATION_FIELDS_KEYS.id, id);
  localStorage.setItem(USER_VERIFICATION_FIELDS_KEYS.token, token);
};

export {
  getUserVerificationDataFromLocalStorage,
  saveUserVerificationDataToLocalStorage,
};
