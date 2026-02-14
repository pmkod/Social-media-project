import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/services/http.client";
import { USER_VERIFICATION_FIELDS_KEYS } from "../authentication.constants";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";

type DoUserVerificationParams = {
  code: string;
};

const useUserVerification = () => {
  return useMutation({
    mutationFn: (body: DoUserVerificationParams) => {
      const { userVerification } = getUserVerificationDataFromLocalStorage();
      return baseHttpClient.post("authentication/user-verification", {
        json: {
          userVerification: {
            id: userVerification.id,
            token: userVerification.token,
            code: body.code,
          },
        },
      });
    },
  });
};

export { useUserVerification };
