import { useMutation } from '@tanstack/react-query';

import { baseHttpClient } from '@/core/http-clients/http-client';
import { saveVerificationResponse } from '@/features/authentication/auth.utils';

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
};

export function useSignup() {
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const response = await baseHttpClient
        .post('authentication/signup', { json: input })
        .json<{ userVerification?: { id: string; token: string } }>();
      return saveVerificationResponse(response);
    },
  });
}
