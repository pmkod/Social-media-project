import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/services/http.client";
import type { UserVerificationResponse } from "@/features/authentication/types/user-verification-response";
import { saveUserVerificationDataToLocalStorage } from "../authentication.utils";

type PasswordResetRequestBody = {
  email: string;
};

const usePasswordReset = () => {
  return useMutation({
    mutationFn: async (body: PasswordResetRequestBody) => {
      const { userVerification } = await baseHttpClient
        .post("authentication/password-reset", {
          json: body,
        })
        .json<UserVerificationResponse>();
      saveUserVerificationDataToLocalStorage(userVerification);
    },
  });
};

export { usePasswordReset };
