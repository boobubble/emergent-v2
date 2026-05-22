import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";

const USERS_KEY = "palrgo:auth:users:v1";
const SESSION_KEY = "palrgo:auth:session:v1";

interface StoredUser {
  email: string;
  password: string; // mock only — never do this in production
  username: string;
  createdAt: number;
}

export interface AuthUser {
  email: string;
  username: string;
}

interface Ctx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function saveUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function loadSession(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(loadSession());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setUser(loadSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) throw new Error("No account with that email");
    if (found.password !== password) throw new Error("Incorrect password");
    const session: AuthUser = { email: found.email, username: found.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    email = email.trim();
    username = username.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    if (password.length < 6) throw new Error("Password must be 6+ characters");
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) throw new Error("Username: 3-20 chars, letters/numbers/_-");
    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error("Username taken");
    users.push({ email, password, username, createdAt: Date.now() });
    saveUsers(users);
    const session: AuthUser = { email, username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<Ctx>(() => ({ user, ready, login, signup, logout }), [user, ready, login, signup, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
