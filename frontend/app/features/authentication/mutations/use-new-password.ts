import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";
import { baseHttpClient } from "@/core/services/http.client";
import type { AuthenticatedResponse } from "../types/authenticated-response";
import { saveAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";

type NewPasswordRequestBody = {
  newPassword: string;
};

const useNewPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewPasswordRequestBody) => {
      const { userVerification } = getUserVerificationDataFromLocalStorage();
      const { accessToken, refreshToken } = await baseHttpClient
        .post("authentication/new-password", {
          json: {
            userVerification: {
              id: userVerification.id,
              token: userVerification.token,
            },
            newPassword: body.newPassword,
          },
        })
        .json<AuthenticatedResponse>();
      saveAccessAndRefreshToken({ accessToken, refreshToken });
      queryClient.refetchQueries({
        queryKey: userQueryKeys.loggedInUser.queryKey,
      });
    },
  });
};

export { useNewPassword };
