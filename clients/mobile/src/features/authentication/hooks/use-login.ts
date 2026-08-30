import { useMutation } from '@tanstack/react-query';

import { baseHttpClient } from '@/core/http-clients/http-client';
import { saveVerificationResponse } from '@/features/authentication/auth.utils';

type LoginInput = {
  emailOrUsername: string;
  password: string;
};

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const response = await baseHttpClient
        .post('authentication/login', { json: input })
        .json<{ userVerification?: { id: string; token: string } }>();
      return saveVerificationResponse(response);
    },
  });
}
