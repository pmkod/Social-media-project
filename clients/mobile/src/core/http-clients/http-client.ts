import {
  clearSessionStorage,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/core/auth/auth.storage';
import { baseHttpClient } from '@/core/http-clients/base.http-client';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

let refreshRequest: Promise<RefreshTokenResponse | null> | null = null;

async function refreshTokens() {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearSessionStorage();
      return null;
    }

    try {
      const tokens = await baseHttpClient
        .post('authentication/refresh-token', { json: { refreshToken } })
        .json<RefreshTokenResponse>();
      await saveTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    } catch {
      await clearSessionStorage();
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

const httpClient = baseHttpClient.extend({
  hooks: {
    beforeRequest: [
      async ({ retryCount, request }) => {
        if (retryCount !== 0) return;
        const accessToken = await getAccessToken();
        if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`);
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        if (response.status !== 401 || retryCount !== 0) return response;

        const tokens = await refreshTokens();
        if (!tokens) return response;

        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${tokens.accessToken}`);
        return baseHttpClient(new Request(request, { headers }));
      },
    ],
  },
});

export { baseHttpClient, httpClient };
