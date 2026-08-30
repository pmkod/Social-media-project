import ky, { isHTTPError } from 'ky';

import { API_BASE_URL } from '@/core/config/api.config';

const baseHttpClient = ky.create({
  baseUrl: API_BASE_URL,
  retry: { limit: 1 },
  timeout: 20_000,
  hooks: {
    beforeError: [
      ({ error }) => {
        if (
          isHTTPError(error) &&
          typeof error.data === 'object' &&
          error.data !== null &&
          'message' in error.data &&
          typeof error.data.message === 'string'
        ) {
          error.message = error.data.message;
        }

        return error;
      },
    ],
  },
});

export { baseHttpClient };
