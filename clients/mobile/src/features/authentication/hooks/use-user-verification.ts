import { useMutation } from '@tanstack/react-query';

import { baseHttpClient } from '@/core/http-clients/http-client';
import { requireVerification } from '@/features/authentication/auth.utils';

export function useUserVerification() {
  return useMutation({
    mutationFn: async (code: string) => {
      const verification = await requireVerification();
      return baseHttpClient.post('authentication/user-verification', {
        json: { userVerification: { ...verification, code } },
      });
    },
  });
}
