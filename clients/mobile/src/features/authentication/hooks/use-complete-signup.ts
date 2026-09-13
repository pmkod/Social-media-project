import { useMutation } from '@tanstack/react-query';

import type { AuthSession } from '@/core/auth/auth.types';
import { baseHttpClient } from '@/core/http-clients/http-client';
import { requireVerification } from '@/features/authentication/auth.utils';

type CompleteSignupResponse = {
  session: AuthSession;
};

export function useCompleteSignup() {
  return useMutation({
    mutationFn: async (username: string) => {
      const verification = await requireVerification();
      return baseHttpClient
        .post('authentication/complete-signup', {
          json: { userVerification: verification, username },
        })
        .json<CompleteSignupResponse>();
    },
  });
}
