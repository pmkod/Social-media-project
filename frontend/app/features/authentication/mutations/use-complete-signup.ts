import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/services/http.client";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";
import type { AuthenticatedResponse } from "../types/authenticated-response";
import { saveAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";

type CompleteSignupResponse = {
  user: {
    role: string;
  };
} & AuthenticatedResponse;

const useCompleteSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { userVerification } = getUserVerificationDataFromLocalStorage();
      const { accessToken, refreshToken, user } = await baseHttpClient
        .post("authentication/complete-signup", {
          json: {
            userVerification: {
              id: userVerification.id,
              token: userVerification.token,
            },
          },
        })
        .json<CompleteSignupResponse>();

      saveAccessAndRefreshToken({ accessToken, refreshToken });
      queryClient.refetchQueries({
        queryKey: userQueryKeys.loggedInUser.queryKey,
      });
      return { user };
    },
  });
};

export { useCompleteSignup };
