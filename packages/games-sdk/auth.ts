import type { SDKResult, UserId } from "./types";

export interface AuthSession {
  userId: UserId;
  username?: string;
  token?: string;
  expiresAt?: string;
}

export interface AuthAdapter {
  getSession(): Promise<SDKResult<AuthSession | null>>;
  isAuthenticated(): Promise<boolean>;
  requireAuth(): Promise<SDKResult<AuthSession>>;
  onAuthChange(listener: (session: AuthSession | null) => void): () => void;
}
