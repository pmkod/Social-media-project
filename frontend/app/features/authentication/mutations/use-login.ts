import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/services/http.client";
import type { UserVerificationResponse } from "@/features/authentication/types/user-verification-response";
import { saveUserVerificationDataToLocalStorage } from "../authentication.utils";

type LoginRequestBody = {
  email: string;
  password: string;
};

const useLogin = () => {
  return useMutation({
    mutationFn: async (body: LoginRequestBody) => {
      const { userVerification } = await baseHttpClient
        .post("authentication/login", {
          json: body,
        })
        .json<UserVerificationResponse>();
      saveUserVerificationDataToLocalStorage(userVerification);
    },
  });
};

export { useLogin };
