import { Config } from "../config";
import { logger } from "./logger";

type CreatePostBody = { text: string };
type CreateCommentBody = { content: string };

type SessionCredentials = { sessionId: string; sessionToken: string };

const sessionCredentialsByUserId = new Map<string, Promise<SessionCredentials>>();

const createSession = async (userId: string): Promise<SessionCredentials> => {
  const response = await fetch(`${Config.sessionServiceBaseUrl}/internal/session/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      ipAddress: null,
      userAgent: "social-media-data-bootstrap",
    }),
  });
  if (!response.ok) {
    throw new Error(`Session service failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    session?: { id?: string; token?: string };
  };
  if (!data.session?.id || !data.session.token) {
    throw new Error("Session service returned invalid credentials");
  }

  return { sessionId: data.session.id, sessionToken: data.session.token };
};

const getSessionCredentials = (userId: string) => {
  const existingCredentials = sessionCredentialsByUserId.get(userId);
  if (existingCredentials) return existingCredentials;

  const credentials = createSession(userId);
  sessionCredentialsByUserId.set(userId, credentials);
  return credentials;
};

const apiFetch = async <T>(path: string, userId: string, options: RequestInit = {}): Promise<T> => {
  const { sessionId, sessionToken } = await getSessionCredentials(userId);
  const url = `${Config.gatewayBaseUrl}${path}`;

  logger.info(`API call: ${options.method ?? "GET"} ${url} as user ${userId}`);

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Session ${sessionId}.${sessionToken}`);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return response.json() as Promise<T>;
};

const cleanupApiSessions = async () => {
	const entries = [...sessionCredentialsByUserId.entries()];
  await Promise.allSettled(
    entries.map(async ([_userId, credentialsPromise]) => {
      const { sessionId, sessionToken } = await credentialsPromise;
      await fetch(`${Config.gatewayBaseUrl}/session/disable-session/${sessionId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Session ${sessionId}.${sessionToken}`,
        },
      });
    }),
  );
  sessionCredentialsByUserId.clear();
};

const createPostViaApi = async (userId: string, body: CreatePostBody): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("text", body.text);
  const response = await apiFetch<{ post: { id: string } }>("/content/create-post", userId, {
    method: "POST",
    body: formData,
  });
  return response.post;
};

const createCommentViaApi = async (userId: string, postId: string, body: CreateCommentBody): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("postId", postId);
  formData.append("content", body.content);

  const response = await apiFetch<{ comment: { id: string } }>("/content/create-comment", userId, {
    method: "POST",
    body: formData,
  });

  return response.comment;
};

const likePostViaApi = async (userId: string, postId: string): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>(`/content/like-post/${postId}`, userId, {
    method: "POST",
  });
};

const likeCommentViaApi = async (userId: string, commentId: string): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>(`/content/like-comment/${commentId}`, userId, {
    method: "POST",
  });
};

export {
  cleanupApiSessions,
  createPostViaApi,
  createCommentViaApi,
  likePostViaApi,
  likeCommentViaApi,
};
