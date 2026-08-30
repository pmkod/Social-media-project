import { useMutation } from '@tanstack/react-query';

import { baseHttpClient } from '@/core/http-clients/http-client';
import { saveVerificationResponse } from '@/features/authentication/auth.utils';

export function usePasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await baseHttpClient
        .post('authentication/password-reset', { json: { email } })
        .json<{ userVerification?: { id: string; token: string } }>();
      return saveVerificationResponse(response);
    },
  });
}
