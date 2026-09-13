import { useMutation } from '@tanstack/react-query';

import type { AuthSession } from '@/core/auth/auth.types';
import { baseHttpClient } from '@/core/http-clients/http-client';
import { requireVerification } from '@/features/authentication/auth.utils';

type NewPasswordResponse = {
  session: AuthSession;
};

export function useNewPassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const verification = await requireVerification();
      return baseHttpClient
        .post('authentication/new-password', {
          json: { userVerification: verification, newPassword },
        })
        .json<NewPasswordResponse>();
    },
  });
}
