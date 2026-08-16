import jwt from "jsonwebtoken";
import { Config } from "../config";
import { logger } from "./logger";

type CreatePostBody = { text: string; mediaUrls?: string[] };
type CreateCommentBody = { content: string };

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, Config.accessTokenSecretKey, {
    expiresIn: Config.accessTokenExpirationSec,
  });
};

const apiFetch = async <T>(path: string, userId: string, options: RequestInit = {}): Promise<T> => {
  const token = generateAccessToken(userId);
  const url = `${Config.gatewayBaseUrl}${path}`;

  logger.info(`API call: ${options.method ?? "GET"} ${url} as user ${userId}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return response.json() as Promise<T>;
};

const createPostViaApi = async (userId: string, body: CreatePostBody): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>("/posts", userId, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const createCommentViaApi = async (userId: string, postId: string, body: CreateCommentBody): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>(`/posts/${postId}/comments`, userId, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const likePostViaApi = async (userId: string, postId: string): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>(`/posts/${postId}/likes`, userId, {
    method: "POST",
  });
};

const likeCommentViaApi = async (userId: string, commentId: string): Promise<{ id: string }> => {
  return apiFetch<{ id: string }>(`/comments/${commentId}/like`, userId, {
    method: "POST",
  });
};

export { createPostViaApi, createCommentViaApi, likePostViaApi, likeCommentViaApi };
