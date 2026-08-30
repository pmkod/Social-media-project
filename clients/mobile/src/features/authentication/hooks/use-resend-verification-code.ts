import { useMutation } from '@tanstack/react-query';

import { baseHttpClient } from '@/core/http-clients/http-client';
import { requireVerification } from '@/features/authentication/auth.utils';

export function useResendVerificationCode() {
  return useMutation({
    mutationFn: async () => {
      const verification = await requireVerification();
      return baseHttpClient.post('authentication/resend-user-verification-code', {
        json: { userVerification: verification },
      });
    },
  });
}
