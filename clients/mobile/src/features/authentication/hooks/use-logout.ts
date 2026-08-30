import { useMutation } from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';

export function useLogout() {
  return useMutation({
    mutationFn: () => httpClient.post('authentication/logout'),
  });
}
