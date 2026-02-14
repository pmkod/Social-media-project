import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";
import { baseHttpClient } from "@/core/services/http.client";
import type { AuthenticatedResponse } from "../types/authenticated-response";
import { saveAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";

type CompleteLoginResponse = {
  user: {
    role: string;
  };
} & AuthenticatedResponse;

const useCompleteLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { userVerification } = getUserVerificationDataFromLocalStorage();
      const { accessToken, refreshToken, user } = await baseHttpClient
        .post("authentication/complete-login", {
          json: {
            userVerification: {
              id: userVerification.id,
              token: userVerification.token,
            },
          },
        })
        .json<CompleteLoginResponse>();
      saveAccessAndRefreshToken({ accessToken, refreshToken });
      queryClient.refetchQueries({
        queryKey: userQueryKeys.loggedInUser.queryKey,
      });
      return { user };
    },
  });
};

export { useCompleteLogin };
