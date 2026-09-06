import {
  clearSessionStorage,
  getSessionCredentials,
} from '@/core/auth/auth.storage';
import { baseHttpClient } from '@/core/http-clients/base.http-client';

const httpClient = baseHttpClient.extend({
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const credentials = await getSessionCredentials();
        if (credentials) {
          request.headers.set(
            'Authorization',
            `Session ${credentials.sessionId}.${credentials.sessionToken}`
          );
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (response.status === 401) await clearSessionStorage();
        return response;
      },
    ],
  },
});

export { baseHttpClient, httpClient };
