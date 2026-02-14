import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/services/http.client";
import type { User } from "./types/user";
import { userQueryKeys } from "./user.query-keys";
import { getAccessToken } from "@/core/utils/authorization.utils";

type UseLoggedInUserQueryData = {
  user: User;
};

const useLoggedInUser = () => {
  return useQuery({
    queryKey: userQueryKeys.loggedInUser.queryKey,
    queryFn: () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw Error();
      }
      return httpClient.get("users/me").json<UseLoggedInUserQueryData>();
    },
  });
};

export { useLoggedInUser, type UseLoggedInUserQueryData };
