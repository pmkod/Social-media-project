import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/services/http.client";
import type { UserVerificationResponse } from "@/features/authentication/types/user-verification-response";
import { USER_VERIFICATION_FIELDS_KEYS } from "../authentication.constants";
import { saveUserVerificationDataToLocalStorage } from "../authentication.utils";

type SignupRequestBody = {
  storeName?: string;

  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: string;
};

const useSignup = () => {
  return useMutation({
    mutationFn: async (body: SignupRequestBody) => {
      const { userVerification } = await baseHttpClient
        .post("authentication/signup", {
          json: body,
        })
        .json<UserVerificationResponse>();
      saveUserVerificationDataToLocalStorage(userVerification);
    },
  });
};

export { useSignup };
