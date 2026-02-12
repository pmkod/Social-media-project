import type { Request } from "express";

interface ProtectedRouteRequest extends Request {
  loggedInUser?: {
    id: string;
    refreshTokenId: string;
  };
}

export type { ProtectedRouteRequest };
