import { useMutation } from '@tanstack/react-query';

import type { AuthSession } from '@/core/auth/auth.types';
import { baseHttpClient } from '@/core/http-clients/http-client';
import { requireVerification } from '@/features/authentication/auth.utils';

type CompleteLoginResponse = {
  session: AuthSession;
};

export function useCompleteLogin() {
  return useMutation({
    mutationFn: async () => {
      const verification = await requireVerification();
      return baseHttpClient
        .post('authentication/complete-login', {
          json: { userVerification: verification },
        })
        .json<CompleteLoginResponse>();
    },
  });
}
